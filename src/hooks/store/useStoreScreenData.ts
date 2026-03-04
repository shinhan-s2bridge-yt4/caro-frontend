import { useEffect, useMemo, useState } from 'react';
import {
  fetchMemberCouponDetail,
  fetchMemberCoupons,
  fetchPointHistory,
  fetchRewardCategories,
  fetchRewardCoupons,
  type MemberCoupon,
  type MemberCouponDetail,
  type PointHistory,
  type RewardCategory,
  type RewardCoupon,
} from '@/services/rewardService';
import { useMemberPoints } from '@/hooks/store/useMemberPoints';

const FIXED_CATEGORY_KEYS = ['ALL', 'POPULAR', 'CHEAP'] as const;

interface UseStoreScreenDataParams {
  accessToken: string | null;
  selectedTab: string;
  storeCategory: string;
}

export function useStoreScreenData({
  accessToken,
  selectedTab,
  storeCategory,
}: UseStoreScreenDataParams) {
  const { memberPoints } = useMemberPoints({ accessToken });

  const [apiCategories, setApiCategories] = useState<RewardCategory[]>([]);
  const [rewardCoupons, setRewardCoupons] = useState<RewardCoupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [pointHistories, setPointHistories] = useState<PointHistory[]>([]);
  const [historyTotalCount, setHistoryTotalCount] = useState(0);
  const [memberCoupons, setMemberCoupons] = useState<MemberCoupon[]>([]);
  const [couponTotalCount, setCouponTotalCount] = useState(0);

  useEffect(() => {
    fetchRewardCategories()
      .then((data) => setApiCategories(data))
      .catch((err) => console.warn('카테고리 조회 실패:', err));
  }, []);

  const storeCategories = useMemo(() => {
    const fixed = [
      { key: 'ALL', label: '전체' },
      { key: 'POPULAR', label: '인기' },
      { key: 'CHEAP', label: '할인 높은 순' },
    ];
    const dynamic = apiCategories.map((c) => ({
      key: c.category,
      label: c.categoryLabel,
    }));
    return [...fixed, ...dynamic];
  }, [apiCategories]);

  useEffect(() => {
    const isFixedCategory = FIXED_CATEGORY_KEYS.includes(storeCategory as (typeof FIXED_CATEGORY_KEYS)[number]);
    const params = isFixedCategory
      ? { sort: storeCategory, size: 20 }
      : { category: storeCategory, size: 20 };

    setCouponsLoading(true);
    fetchRewardCoupons(params)
      .then((data) => setRewardCoupons(data.rewardCoupons))
      .catch((err) => {
        console.warn('쿠폰 목록 조회 실패:', err);
        setRewardCoupons([]);
      })
      .finally(() => setCouponsLoading(false));
  }, [storeCategory]);

  useEffect(() => {
    fetchPointHistory()
      .then((data) => {
        setPointHistories(data.histories);
        setHistoryTotalCount(data.totalCount);
      })
      .catch((err) => {
        console.warn('포인트 이력 조회 실패:', err);
        setPointHistories([]);
        setHistoryTotalCount(0);
      });
  }, []);

  useEffect(() => {
    if (selectedTab !== 'coupon') return;

    fetchMemberCoupons()
      .then((data) => {
        setMemberCoupons(data.coupons);
        setCouponTotalCount(data.totalCount);
      })
      .catch((err) => {
        console.warn('보유쿠폰 조회 실패:', err);
        setMemberCoupons([]);
        setCouponTotalCount(0);
      });
  }, [selectedTab]);

  const pointTotal = memberPoints?.availablePoints ?? 0;

  const pointBreakdown = useMemo(
    () => ({
      attendance: memberPoints?.totalAttendancePoints ?? 0,
      driving: memberPoints?.totalDrivingPoints ?? 0,
      used: memberPoints?.totalUsedPoints ?? 0,
    }),
    [memberPoints],
  );

  const fetchCouponDetailById = async (couponId: number): Promise<MemberCouponDetail | null> => {
    try {
      return await fetchMemberCouponDetail(couponId);
    } catch (err) {
      console.warn('쿠폰 상세 조회 실패:', err);
      return null;
    }
  };

  return {
    storeCategories,
    rewardCoupons,
    couponsLoading,
    pointHistories,
    historyTotalCount,
    memberCoupons,
    couponTotalCount,
    pointTotal,
    pointBreakdown,
    fetchCouponDetailById,
  };
}
