import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.mrmaftahsa.hurufwakalimat',
  appName: 'حروف وكلمات',
  webDir: 'dist',
  backgroundColor: '#f7f3eb',
  plugins: {
    SystemBars: {
      insetsHandling: 'native',
    },
  },
}

export default config
