import { router } from 'expo-router';
import { Suspense, use } from 'react';

import {
  jiosaavnApi,
  spotifyApi,
  SpotifyPlaylistDetailsWithFields,
  SpotifyPlaylistTrack,
} from '@/api';
import { useSession } from '@/auth/context/AuthSessionProvider';
import { ListLayout } from '@/components/layouts/list-layout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorIndicator } from '@/components/ui/ErrorIndicator';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { db } from '@/db';
import { playlistsSongsTable, playlistsTable } from '@/db/schema';
import { useOverlayLoader } from '@/hooks/useOverlayLoader';
import { uuidv4 } from '@/utils/uuid';

type Playlist = typeof playlistsTable.$inferSelect;

async function processPlaylistItems(items: SpotifyPlaylistTrack[]) {
  /**
   * 1. Loop through each item in the playlist
   * 2. generate a search query to find the song
   * 2. call dataSource.searchSongs(query, page=1, perPage=1), use the search query here
   * 3. if the song is found, add it to the playlist
   * 4. if the song is not found, add it to the playlist with a note that it was not found
   */

  const promises = items.map(async (item) => {
    const track = item.track;
    const album = track.album;
    const artists = track.artists.map((artist) => artist.name).join(', ');

    // Create a search query
    const query = `${track.name} ${artists} ${album.name}`;

    // Search for the song
    const response = await jiosaavnApi.searchSongs(query, {
      page: 1,
      perPage: 1,
    });
    console.log('Response:', response);

    if ((response?.results ?? []).length > 0) {
      // Song found, add it to the playlist
      console.log('Song found:', response?.results[0]);
      // Add to playlist logic here
      return response?.results[0];
    } else {
      // Song not found, add a note to the playlist
      console.log('Song not found:', track.name);
      // Add to playlist logic here
      return null;
    }
  });

  const res = await Promise.all(promises);
  const songIds = res?.filter((item) => item !== null).map((item) => item!.id);

  return songIds;
}

type ImportedPlaylist = {
  name: string;
  image: string | null;
  songIds: string[];
};
async function importSpotifyPlaylist(
  token: string,
  playlistIdOrUrl: string
): Promise<ImportedPlaylist | null> {
  // Alternative usage with a more versatile regex that also works with direct IDs:
  const moreVersatileRegex =
    /(?:spotify\.com\/playlist\/|^)([a-zA-Z0-9]{22})(?:\?|$)/;
  // https://open.spotify.com/playlist/2AR0lkJMdv9obt0xQeqvhH?si=i9MUWkEWRi2aXEhcC6xoqw
  const match = playlistIdOrUrl.match(moreVersatileRegex);
  const id = match ? match[1] : null;
  console.log('ID:', id);

  let success = false;
  let playlist: ImportedPlaylist | null = null;

  if (id) {
    try {
      const playlistDetails = await spotifyApi.fetchPlaylistDetails(
        id,
        ['name', 'images'],
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Playlist Details:', playlistDetails);

      const nameOfPlaylist = playlistDetails.name;
      const playlistImage = playlistDetails?.images[0]?.url || null;

      const allPlaylistItems = await spotifyApi.fetchAllItemsInPlaylist(id, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let songIds = await processPlaylistItems(allPlaylistItems);
      console.log('Successfully imported playlist:', nameOfPlaylist);

      playlist = {
        name: nameOfPlaylist,
        image: playlistImage,
        songIds: songIds || [],
      };

      success = true;
    } catch (error) {
      console.error('Error fetching playlist details:', error);
    }
  }

  return success ? playlist : null;
}

const fetchPlaylist = async (id: string, token: string) => {
  if (!id || !token) return Promise.reject('No token or playlistId provided!');

  const playlist = await spotifyApi.fetchPlaylistDetails(
    id,
    ['id', 'name', 'images', 'description'],
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return playlist;
};

const fetchPlaylistSongs = async (
  id: string,
  token: string
): Promise<SpotifyPlaylistTrack[]> => {
  if (!id || !token) return Promise.reject('No token or playlistId provided!');

  const playlist = await spotifyApi.fetchAllItemsInPlaylist(id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return playlist;
};

const SpotifyPlaylistDisplay = ({
  songsPromise,
  playlistPromise,
}: {
  songsPromise: Promise<SpotifyPlaylistTrack[]>;
  playlistPromise: Promise<
    SpotifyPlaylistDetailsWithFields<['id', 'name', 'images', 'description']>
  >;
}) => {
  const { user, token } = useSession();
  const songs = use(songsPromise);
  const playlist = use(playlistPromise);
  const overlayLoader = useOverlayLoader();

  const onItemPress = async (item: {
    id: string;
    title: string;
    uri?: string;
  }) => {
    console.log('onItemPress', item);
    overlayLoader.setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const song = songs.find((s) => s.track.id === item.id);
      if (song) {
        // await TrackPlayer.reset();
        // await TrackPlayer.add({
        //   url: song.track.uri || '',
        //   title: song.track.name,
        //   artist: song.track.artists.map((artist) => artist.name).join(', '),
        //   artwork: song.track.album.images[0].url,
        //   duration: Number(song.track.duration_ms / 1000),
        //   id: song.track.id,
        // });
        // await TrackPlayer.play();
        // Linking.openURL(song.track.uri);
      }
    } finally {
      overlayLoader.setLoading(false);
    }
  };

  const handleCreatePlaylist = async (
    name: string,
    playlistImage: string | null,
    songIds: string[]
  ) => {
    console.log('Creating playlist with name:', name);

    const id = uuidv4();
    const p1 = db
      .insert(playlistsTable)
      .values({
        id: id,
        name: name,
        author: user?.id,
        image: playlistImage,
      })
      .onConflictDoNothing()
      .prepare();

    await p1.execute();

    console.log('Playlist created with ID:', id);
    console.log('Song IDs:', songIds);
    // Add songs to the playlist
    const p2 = db
      .insert(playlistsSongsTable)
      .values(
        songIds.map((songId) => ({
          playlistId: id,
          songId: songId,
        }))
      )
      .onConflictDoNothing()
      .prepare();
    await p2.execute();

    console.log('Songs added to the playlist');

    // router.replace(
    //   {
    //     pathname: '/local/playlist/[id]',
    //     params: { id: id },
    //   },
    //   { relativeToDirectory: true }
    // );
  };

  const handleImportPlaylist = async (playlistIdOrUrl: string) => {
    if (!token) {
      console.error('Access token is not available');
      return;
    }

    // Validate the input
    const moreVersatileRegex =
      /(?:spotify\.com\/playlist\/|^)([a-zA-Z0-9]{22})(?:\?|$)/;

    const match = playlistIdOrUrl.match(moreVersatileRegex);
    const id = match ? match[1] : null;
    if (!id) {
      console.error('Invalid playlist ID or URL!');
      return;
    }

    let success = false;
    overlayLoader.setLoading(true);
    try {
      const playlistDetails = await importSpotifyPlaylist(
        token as string,
        playlistIdOrUrl
      );

      console.log('Playlist Details:', playlistDetails);
      if (playlistDetails) {
        await handleCreatePlaylist(
          playlistDetails.name,
          playlistDetails.image,
          playlistDetails.songIds
        );

        success = true;
      }
    } catch (error) {
      console.error('Error fetching playlist details:', error);
    } finally {
      overlayLoader.setLoading(false);
    }

    if (success) {
      router.replace({
        pathname: '/playlist/[id]',
        params: { id: id },
      });
    }
  };

  return (
    <ListLayout
      moreIcon="download"
      title={playlist.name}
      itemCount={songs.length}
      image={playlist.images[0].url}
      description={playlist.description}
      items={songs.map((item) => ({
        ...item.track,
        uri: item.track.preview_url,
        isPlayable: item.track.is_playable,
        id: item.track.id,
        title: item.track.name,
        description: item.track.artists.map((artist) => artist.name).join(', '),
        image: item.track.album.images[0].url,
        duration: Math.floor(item.track.duration_ms / 1000),
      }))}
      onItemPress={onItemPress}
      onMorePress={() => handleImportPlaylist(playlist.id)}
    />
  );
};

export default function SpotifyPlaylistScreen({
  playlistId,
}: {
  playlistId: string;
}) {
  const { token } = useSession();
  const songsPromise = fetchPlaylistSongs(playlistId, token || '');
  const playlistPromise = fetchPlaylist(playlistId, token || '');

  return (
    <ErrorBoundary fallback={<ErrorIndicator />}>
      <Suspense fallback={<LoadingIndicator />}>
        <SpotifyPlaylistDisplay
          songsPromise={songsPromise}
          playlistPromise={playlistPromise}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
