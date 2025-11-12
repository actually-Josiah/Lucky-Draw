// config/prizes.js

const PRIZES = {
  main: [
    { name: 'Car', reward_text: 'Main_Car' },
  ],
  large: [
    { name: 'MacBook Pro', reward_text: 'Large_Macbook' },
    { name: 'iPhone 15', reward_text: 'Large_iPhone' },
    { name: 'Vacation Trip', reward_text: 'Large_Trip' },
    { name: 'Smart TV', reward_text: 'Large_TV' },
    { name: 'Gaming Console', reward_text: 'Large_Console' },
  ],
  mid: [
    { name: '$100 Coupon', reward_text: 'Mid_Coupon_100' },
    { name: 'AirPods', reward_text: 'Mid_Airpods' },
    { name: 'Dinner for Two', reward_text: 'Mid_Dinner' },
    { name: 'Fitness Watch', reward_text: 'Mid_Watch' },
    { name: 'Bluetooth Speaker', reward_text: 'Mid_Speaker' },
  ],
  small: [
    { name: 'Free Coffee', reward_text: 'Small_Coffee' },
    { name: 'Free Dessert', reward_text: 'Small_Dessert' },
    { name: 'Free Soda', reward_text: 'Small_Soda' },
    { name: '10% Discount', reward_text: 'Small_10Percent' },
    { name: 'Free Fries', reward_text: 'Small_Fries' },
  ],
};
  
const CATEGORY_CONFIG = [
  { category: 'main', probability: 0.001 },
  { category: 'large', probability: 0.009 },
  { category: 'mid', probability: 0.05 },
  { category: 'small', probability: 0.15 },
  { category: 'none', probability: 0.79 },
];

module.exports = { PRIZES, CATEGORY_CONFIG };
