import { ComponentTypeEnum } from '../../interface/type';
import { geoLayout } from '../utils';
import { registerMarkPointAnimate } from '@visactor/vrender-components';
import { Factory } from '../../../core/factory';
import { BaseMarkPoint } from './base-mark-point';

export class GeoMarkPoint extends BaseMarkPoint {
  static type = ComponentTypeEnum.geoMarkPoint;
  type = ComponentTypeEnum.geoMarkPoint;
  name: string = ComponentTypeEnum.geoMarkPoint;
  static coordinateType: string = 'geo';
  coordinateType = 'geo';

  protected _computePointsAttr() {
    const data = this._markerData;
    const relativeSeries = this._relativeSeries;
    const point = geoLayout(data, relativeSeries)[0][0];

    return { point };
  }

  protected _computeOptions(): any {
    const spec = this._spec as any;
    const options = [this._processSpecName(spec.name)];
    return { options };
  }
}

export const registerGeoMarkPoint = () => {
  Factory.registerComponent(GeoMarkPoint.type, GeoMarkPoint);
  registerMarkPointAnimate();
};
