import type { IMarkAreaLabelPosition, IMarkCommonArcLabelPosition } from '@visactor/vrender-components';
import type { IArcMarkSpec, IPolygonMarkSpec } from '../../../../typings';
import type { IMarkerLabelWithoutRefSpec, IMarkerState } from '../../interface';

export interface IMarkAreaTheme {
  area?: Partial<IMarkerState<IPolygonMarkSpec | IArcMarkSpec>>;

  label?: {
    /**
     * label整体 - 相对line的位置
     */
    position?: keyof typeof IMarkAreaLabelPosition | IMarkCommonArcLabelPosition;
  } & IMarkerLabelWithoutRefSpec;
}
