import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import CouponTab from '@/components/common/Category/CouponTab';

const meta: Meta<typeof CouponTab> = {
  title: 'Common/Category/CouponTab',
  component: CouponTab,
};

export default meta;

type Story = StoryObj<typeof CouponTab>;

const tabs = [
  { id: 'mail', label: '마일' },
  { id: 'coupon', label: '쿠폰' },
  { id: 'usage', label: '사용 내역' },
];

/**
 * 마일 선택된 상태
 */
export const MailSelected: Story = {
  render: () => {
    const [selectedTab, setSelectedTab] = useState('mail');

    return (
      <View style={{ padding: 20 }}>
        <CouponTab
          tabs={tabs}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />
      </View>
    );
  },
};

/**
 * 쿠폰 선택된 상태
 */
export const CouponSelected: Story = {
  render: () => {
    const [selectedTab, setSelectedTab] = useState('coupon');

    return (
      <View style={{ padding: 20 }}>
        <CouponTab
          tabs={tabs}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />
      </View>
    );
  },
};

/**
 * 사용 내역 선택된 상태
 */
export const UsageSelected: Story = {
  render: () => {
    const [selectedTab, setSelectedTab] = useState('usage');

    return (
      <View style={{ padding: 20 }}>
        <CouponTab
          tabs={tabs}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />
      </View>
    );
  },
};