import type { IAnimationTypeConfig } from '@visactor/vgrammar-core';
import { Factory } from '../../core/factory';

export type TreemapMark = 'leaf' | 'nonLeaf';

export type TreemapAppearPreset = 'growIn' | 'fadeIn';

export const treemapPresetAnimation = (preset: TreemapAppearPreset): IAnimationTypeConfig => {
  switch (preset) {
    case 'fadeIn': {
      return {
        type: 'fadeIn'
      };
    }
    case 'growIn': {
      return {
        type: 'growCenterIn'
      };
    }
    default: {
      return {
        type: 'growCenterIn'
      };
    }
  }
};
export const registerTreemapAnimation = () => {
  Factory.registerAnimation('treemap', (params: unknown, preset: TreemapAppearPreset) => {
    return {
      appear: treemapPresetAnimation(preset),
      enter: { type: 'growCenterIn' },
      exit: { type: 'growCenterOut' },
      disappear: { type: 'growCenterOut' }
    };
  });
};
