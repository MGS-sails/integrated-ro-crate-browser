declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ro-crate-browser-component': {
        'crate-url'?: string;
        'use-button-variant'?: boolean;
      };
    }
  }
}

export {};
