import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'**/*.spec.js',workers:1,timeout:90000,expect:{timeout:15000},reporter:'list'});
