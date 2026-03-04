import { useSyncExternalStore } from "react";
import {
  getMenuItems, subscribeMenu,
  getStaffNames, subscribeStaff,
  getSales, subscribeSales,
  getExpenses, subscribeExpenses,
} from "@/data/store";

export const useMenuItems = () => useSyncExternalStore(subscribeMenu, getMenuItems);
export const useStaffNames = () => useSyncExternalStore(subscribeStaff, getStaffNames);
export const useSales = () => useSyncExternalStore(subscribeSales, getSales);
export const useExpenses = () => useSyncExternalStore(subscribeExpenses, getExpenses);
