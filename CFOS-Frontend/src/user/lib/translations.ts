export type Language = "EN" | "MM";

export const translations = {
  EN: {
    menu: "Menu",
    reviews: "Reviews",
    orders: "My Orders",
    notifications: "Notifications",
    profile: "Profile",
    language: "Language: English",
    logout: "Log Out",
    navigation: "Navigation",
    account: "Account",
    dashboard: "Dashboard",
    walkinPos: "Walk-in POS",
    ordersManagement: "Orders Management",
    menuItems: "Menu Items",
    categories: "Categories",
    reports: "Reports",
    canteenAdmin: "Canteen Admin",
    orderHistory: "Order History",
    users: "Users",
    professorAccount: "Professor Account",
    canteens: "Canteens",
    permissions: "Permissions",
    userReports: "User Reports",
  },
  MM: {
    menu: "မီနူး",
    reviews: "သုံးသပ်ချက်များ",
    orders: "ကျွန်ုပ်၏ အော်ဒါများ",
    notifications: "အကြောင်းကြားစာများ",
    profile: "ပရိုဖိုင်",
    language: "ဘာသာစကား: မြန်မာ",
    logout: "ထွက်ရန်",
    navigation: "လမ်းညွှန်",
    account: "အကောင့်",
    dashboard: "ဒက်ရှ်ဘုတ်",
    walkinPos: "POS ရောင်းချမှု",
    ordersManagement: "အော်ဒါစီမံခန့်ခွဲမှု",
    menuItems: "မီနူး အမယ်များ",
    categories: "အမျိုးအစားများ",
    reports: "အစီရင်ခံစာများ",
    canteenAdmin: "ကန်တင်း အက်ဒမင်",
    orderHistory: "အော်ဒါမှတ်တမ်း",
    users: "အသုံးပြုသူများ",
    professorAccount: "ပရော်ဖက်ဆာ အကောင့်",
    canteens: "ကန်တင်းများ",
    permissions: "ခွင့်ပြုချက်များ",
    userReports: "အသုံးပြုသူ အစီရင်ခံစာများ",
  }
};

export function translate(key: keyof typeof translations.EN, lang: Language): string {
  return translations[lang][key] || translations.EN[key];
}
