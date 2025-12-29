import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useThemeColors, useThemeTypography } from '@/theme/hooks/useTheme';
import { formatNumber } from '@/utils/format/number';

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  total?: number;
}

export interface FetchDataParams {
  page: number;
  limit: number;
  searchQuery?: string;
  signal?: AbortSignal;
}

export interface VirtualizedPaginatedListProps<T> {
  type: 'song' | 'album' | 'playlist' | 'artist';
  fetchData: (params: FetchDataParams) => Promise<PaginatedResponse<T>>;
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  itemsPerPage?: number;
  initialSearchQuery?: string;
  inputPlaceholderText?: string;
  searchQuery?: string;
  searchDebounceMs?: number;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  LoadingComponent?: React.ComponentType<any> | React.ReactElement | null;
  ItemSeparatorComponent?: React.ComponentType<any> | null;
  onDataLoaded?: (data: T[], page: number, total?: number) => void;
  onError?: (error: Error) => void;
  onSearchStart?: (query: string) => void;
  onSearchComplete?: (results: T[], query: string, total?: number) => void;
  flatListProps?: Partial<
    Omit<FlatListProps<T>, 'data' | 'renderItem' | 'keyExtractor'>
  >;
  enablePullToRefresh?: boolean;
  enableLoadMore?: boolean;
  loadingColor?: string;
}

function VirtualizedPaginatedList<T>({
  type,
  fetchData,
  renderItem,
  keyExtractor,
  itemsPerPage = 10,
  initialSearchQuery = '',
  inputPlaceholderText = 'Search...',
  searchDebounceMs = 500,
  ListHeaderComponent = null,
  ListEmptyComponent = null,
  LoadingComponent = null,
  ItemSeparatorComponent = null,
  onDataLoaded,
  onError,
  onSearchStart,
  onSearchComplete,
  flatListProps = {},
  enablePullToRefresh = true,
  enableLoadMore = true,
  loadingColor = 'pink',
}: VirtualizedPaginatedListProps<T>) {
  const colors = useThemeColors();
  const typography = useThemeTypography();

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalResult, setTotalResult] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousSearchQuery = useRef<string>(initialSearchQuery);
  const isMounted = useRef<boolean>(true);

  const loadData = useCallback(
    async (
      pageNum: number,
      type: 'initial' | 'refresh' | 'more',
      search: string
    ): Promise<void> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (type === 'initial') setIsInitialLoading(true);
      if (type === 'more') setLoadingMore(true);

      try {
        const result = await fetchData({
          page: pageNum,
          limit: itemsPerPage,
          searchQuery: search,
          signal: abortControllerRef.current.signal,
        });

        if (!isMounted.current) return;

        if (!result || !Array.isArray(result.data)) {
          throw new Error(
            'Invalid data format: expected { data: Array, hasMore: boolean }'
          );
        }

        const newData = result.data;
        const totalResult = result.total;
        setTotalResult(totalResult ?? 0);

        const hasMoreData =
          result.hasMore !== undefined
            ? result.hasMore
            : newData.length >= itemsPerPage;

        setHasMore(hasMoreData);

        if (type === 'refresh' || type === 'initial') {
          setData(newData);

          if (search && onSearchComplete) {
            onSearchComplete(newData, search, result.total);
          }
        } else {
          setData((prev) => [...prev, ...newData]);
        }

        if (onDataLoaded) {
          onDataLoaded(newData, pageNum, result.total);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;

        if (isMounted.current) {
          console.error(
            '[VirtualizedPaginatedList] Error loading data:',
            error
          );
          if (onError) onError(error as Error);
        }
      } finally {
        if (isMounted.current) {
          setIsInitialLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
          abortControllerRef.current = null;
        }
      }
    },
    [fetchData, itemsPerPage, onDataLoaded, onError, onSearchComplete]
  );

  useEffect(() => {
    isMounted.current = true;
    loadData(1, 'initial', initialSearchQuery);

    return () => {
      isMounted.current = false;
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (previousSearchQuery.current === searchQuery) return;

    previousSearchQuery.current = searchQuery;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (onSearchStart) onSearchStart(searchQuery);

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      loadData(1, 'initial', searchQuery);
    }, searchDebounceMs);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, searchDebounceMs, loadData, onSearchStart]);

  const handleLoadMore = useCallback(() => {
    if (
      isInitialLoading ||
      loadingMore ||
      refreshing ||
      !hasMore ||
      !enableLoadMore
    )
      return;

    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, 'more', searchQuery);
  }, [
    page,
    hasMore,
    loadData,
    refreshing,
    loadingMore,
    searchQuery,
    enableLoadMore,
    isInitialLoading,
  ]);

  const handleRefresh = useCallback(() => {
    if (!enablePullToRefresh) return;
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadData(1, 'refresh', searchQuery);
  }, [enablePullToRefresh, loadData, searchQuery]);

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="pink" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isInitialLoading) {
      return LoadingComponent && React.isValidElement(LoadingComponent) ? (
        LoadingComponent
      ) : (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={loadingColor} />
        </View>
      );
    }

    if (ListEmptyComponent)
      return React.isValidElement(ListEmptyComponent) ? (
        ListEmptyComponent
      ) : (
        <ListEmptyComponent />
      );

    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          {searchQuery
            ? `No results found for "${searchQuery}"`
            : 'No data available'}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, paddingTop: StatusBar.currentHeight || 24 }}>
      <View
        style={{
          paddingTop: 4,
          borderBottomRightRadius: 28,
          borderBottomLeftRadius: 28,
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: 16,
          marginLeft: 10,
          paddingBottom: 6,
        }}
      >
        <Pressable
          style={{
            paddingLeft: 16,
            paddingRight: 10,
          }}
          onPress={() => router.back()}
        >
          <FontAwesome5 name="arrow-left" size={18} color={colors.text} />
        </Pressable>
        <View
          style={{
            flex: 1,
            height: 40,
            borderRadius: 28,
            overflow: 'hidden',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 5,
            gap: 5,
          }}
        >
          <TextInput
            style={{
              flex: 1,
              padding: 0,
              paddingLeft: 10,
              color: colors.text,
            }}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
            }}
            placeholder={inputPlaceholderText}
            placeholderTextColor={colors.textSecondary}
          />
          <View
            style={{
              height: 30,
              borderRadius: 28,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 10,
            }}
          >
            <Text style={[typography.caption, { color: colors.text }]}>
              {totalResult > 0 ? formatNumber(totalResult) : ''}{' '}
              {type.charAt(0).toUpperCase() + type.slice(1)}
              {totalResult > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>
      <FlatList<T>
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={ItemSeparatorComponent}
        refreshControl={
          enablePullToRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={loadingColor}
            />
          ) : undefined
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        keyboardShouldPersistTaps="handled"
        {...flatListProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    padding: 10,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VirtualizedPaginatedList;
