import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { borderRadius, colors, typography } from '@/theme';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import { getDrivingRecordDetail } from '@/services/drivingRecordService';
import type { DrivingRecordDetailResponse } from '@/types/drivingRecord';

import ArrowLeftIcon from '../assets/icons/arrow-left.svg';
import BCarIcon from '../assets/icons/bcar.svg';
import PointIcon from '../assets/icons/point.svg';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function formatDateDisplay(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dayName = DAY_NAMES[d.getDay()];
  return `${y}. ${m}. ${day} (${dayName})`;
}

function formatTime(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

function DetailTag({ label }: { label: '출발' | '도착' }) {
  const bgColor = label === '출발' ? colors.primary[50] : colors.red[40];
  return (
    <View
      style={{
        height: 26,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: typography.fontFamily.pretendard,
          ...typography.styles.captionSemibold,
          color: colors.coolNeutral[10],
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/*
 * ────────────────────────────────────────────────
 *  네이티브용 인라인 HTML 생성
 *  baseUrl로 origin을 localhost:8081로 설정하여
 *  카카오 SDK 도메인 검증 통과
 * ────────────────────────────────────────────────
 */
function buildNativeMapHtml(kakaoKey: string, startAddr: string, endAddr: string) {
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>*{margin:0;padding:0}html,body{width:100%;height:100%;overflow:hidden}#map{width:100%;height:100%}</style>
</head><body>
<div id="map"></div>
<script>
var s=document.createElement('script');
s.src='https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services&autoload=false';
s.onload=function(){
  kakao.maps.load(function(){
    var map=new kakao.maps.Map(document.getElementById('map'),{center:new kakao.maps.LatLng(37.5665,126.978),level:5});
    var gc=new kakao.maps.services.Geocoder(),bd=new kakao.maps.LatLngBounds(),n=0;
    function mi(c){
      var sv='<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44"><path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 28 16 28s16-16 16-28C32 7.163 24.837 0 16 0z" fill="'+c+'"/><circle cx="16" cy="16" r="7" fill="white"/></svg>';
      return new kakao.maps.MarkerImage('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(sv),new kakao.maps.Size(32,44),{offset:new kakao.maps.Point(16,44)});
    }
    function pm(a,c){gc.addressSearch(a,function(r,st){
      if(st===kakao.maps.services.Status.OK){
        var co=new kakao.maps.LatLng(r[0].y,r[0].x);
        new kakao.maps.Marker({map:map,position:co,image:mi(c)});
        bd.extend(co);n++;
        if(n>=2)map.setBounds(bd,80,80,80,80);
      }
    });}
    pm('${startAddr}','#4880ED');
    pm('${endAddr}','#FF8585');
    setTimeout(function(){if(n===1)map.setBounds(bd,80,80,80,80);},3000);
  });
};
s.onerror=function(){
  document.getElementById('map').innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#FF5252;font-size:13px;font-family:sans-serif;padding:20px;text-align:center;">카카오맵 SDK 로드 실패</div>';
};
document.head.appendChild(s);
</script>
</body></html>`;
}

/*
 * ────────────────────────────────────────────────
 *  KakaoMapView – 플랫폼별 분기
 *  웹: public/kakao-map.html (iframe)
 *  네이티브: 인라인 HTML (WebView + baseUrl)
 * ────────────────────────────────────────────────
 */
function KakaoMapView({
  startAddress,
  endAddress,
}: {
  startAddress: string;
  endAddress: string;
}) {
  const kakaoKey = process.env.EXPO_PUBLIC_KAKAO_MAP_KEY || '';

  // --- 웹: public/kakao-map.html을 iframe으로 로드 ---
  if (Platform.OS === 'web') {
    const mapUrl =
      `/kakao-map.html?key=${encodeURIComponent(kakaoKey)}` +
      `&start=${encodeURIComponent(startAddress)}` +
      `&end=${encodeURIComponent(endAddress)}`;

    return (
      <View
        style={{
          width: '100%',
          height: 300,
          borderRadius: borderRadius.lg,
          overflow: 'hidden',
        }}
      >
        <iframe
          src={mapUrl}
          style={{ width: '100%', height: '100%', border: 'none' } as any}
          allow="geolocation"
        />
      </View>
    );
  }

  // --- 네이티브: 인라인 HTML + baseUrl ---
  const WebView = require('react-native-webview').default;
  const escapedStart = startAddress.replace(/'/g, "\\'").replace(/\n/g, ' ');
  const escapedEnd = endAddress.replace(/'/g, "\\'").replace(/\n/g, ' ');
  const html = buildNativeMapHtml(kakaoKey, escapedStart, escapedEnd);

  return (
    <View
      style={{
        width: '100%',
        height: 300,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
      }}
    >
      <WebView
        source={{ html, baseUrl: 'http://localhost:8081' }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        javaScriptEnabled
        originWhitelist={['*']}
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        domStorageEnabled
      />
    </View>
  );
}

export default function CarDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accessToken } = useAuthStore();
  const { primaryCar, loadProfile } = useProfileStore();

  const drivingRecordId = Number(params.drivingRecordId);

  const [detail, setDetail] = useState<DrivingRecordDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!drivingRecordId) return;
    setIsLoading(true);
    setError(false);
    try {
      const data = await getDrivingRecordDetail(drivingRecordId);
      setDetail(data);
    } catch (err) {
      console.error('운행 기록 상세 조회 실패:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [drivingRecordId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    if (accessToken && !primaryCar) {
      loadProfile(accessToken);
    }
  }, [accessToken, primaryCar, loadProfile]);

  const dateDisplay = detail ? formatDateDisplay(detail.startDateTime) : '';
  const startTime = detail ? formatTime(detail.startDateTime) : '';
  const endTime = detail ? formatTime(detail.endDateTime) : '';
  const carModel = detail
    ? [detail.vehicleBrandName, detail.vehicleModelName, detail.vehicleVariantName]
        .filter(Boolean)
        .join(' ')
    : '';
  const plateNumber = primaryCar?.registrationNumber ?? '';
  const carInfoText = plateNumber ? `${carModel}  |  ${plateNumber}` : carModel;

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.background.default }}
    >
      {/* 헤더 */}
      <View
        style={{
          paddingVertical: 12,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: colors.coolNeutral[10],
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ width: 24, height: 24, justifyContent: 'center' }}
          accessibilityRole="button"
          accessibilityLabel="back"
        >
          <ArrowLeftIcon width={24} height={24} />
        </Pressable>
        <Text
          style={{
            fontFamily: typography.fontFamily.pretendard,
            ...typography.styles.h3Semibold,
            color: colors.coolNeutral[80],
          }}
        >
          운행기록
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary[50]} />
        </View>
      ) : error || !detail ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.body2Medium,
              color: colors.coolNeutral[40],
            }}
          >
            운행 기록을 불러올 수 없습니다.
          </Text>
          <Pressable onPress={fetchDetail}>
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Semibold,
                color: colors.primary[50],
              }}
            >
              다시 시도
            </Text>
          </Pressable>
        </View>
      ) : (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {/* 하나의 흰색 카드 */}
        <View
          style={{
            backgroundColor: colors.coolNeutral[10],
            borderRadius: borderRadius.lg,
            paddingTop: 20,
            paddingBottom: 32,
            paddingHorizontal: 20,
            gap: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
            overflow: 'hidden',
          }}
        >
          {/* 날짜 */}
          <Text
            style={{
              fontFamily: typography.fontFamily.pretendard,
              ...typography.styles.h3Semibold,
              color: colors.coolNeutral[80],
            }}
          >
            {dateDisplay} 운행
          </Text>

          {/* 차량 정보 필 */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary[10],
              borderRadius: 12,
              paddingVertical: 8,
              paddingRight: 20,
              paddingLeft: 12,
              gap: 8,
            }}
          >
            <BCarIcon width={20} height={20} />
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Semibold,
                color: colors.primary[50],
              }}
            >
              {carInfoText}
            </Text>
          </View>

          {/* 출발/도착 정보 */}
          <View style={{ gap: 8 }}>
            {/* 출발 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <DetailTag label="출발" />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.captionMedium,
                    color: colors.coolNeutral[60],
                  }}
                >
                  {startTime}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    flex: 1,
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.captionMedium,
                    color: colors.coolNeutral[40],
                  }}
                >
                  {detail.startLocation}
              </Text>
              </View>
            </View>

            {/* 도착 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <DetailTag label="도착" />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.captionMedium,
                    color: colors.coolNeutral[60],
                  }}
                >
                  {endTime}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    flex: 1,
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.captionMedium,
                    color: colors.coolNeutral[40],
                  }}
                >
                  {detail.endLocation}
                </Text>
                </View>
            </View>
          </View>

          {/* 카카오 지도 */}
          <KakaoMapView startAddress={detail.startLocation} endAddress={detail.endLocation} />

          {/* 하단 통계 – 두 개의 박스 */}
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
            }}
          >
            {/* 운행거리 */}
            <View
              style={{
                flex: 1,
                backgroundColor: colors.background.default,
                borderRadius: borderRadius.md,
                paddingVertical: 8,
                paddingHorizontal: 12,
                gap: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.captionMedium,
                  color: colors.coolNeutral[40],
                }}
              >
                운행거리
              </Text>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body2Semibold,
                  color: colors.coolNeutral[80],
                }}
              >
                {detail.distanceKm.toFixed(1)}km
              </Text>
            </View>

            {/* 적립포인트 (수령 완료된 경우만 표시) */}
            {detail.earnedPoints > 0 && (
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.background.default,
                  borderRadius: borderRadius.md,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.captionMedium,
                    color: colors.coolNeutral[40],
                  }}
                >
                  적립포인트
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body2Semibold,
                      color: colors.primary[50],
                    }}
                  >
                    + {detail.earnedPoints.toLocaleString()}
                  </Text>
                  <PointIcon width={18} height={18} />
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}
