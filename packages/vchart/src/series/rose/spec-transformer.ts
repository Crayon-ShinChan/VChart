import { BaseSeriesSpecTransformer } from '../base';
import { SeriesMarkNameEnum } from '../interface';
import type { IRoseSeriesSpec, IRoseSeriesTheme } from './interface';

export class RoseSeriesSpecTransformer<
  T extends IRoseSeriesSpec = IRoseSeriesSpec,
  K extends IRoseSeriesTheme = IRoseSeriesTheme
> extends BaseSeriesSpecTransformer<T, K> {
  protected _transformLabelSpec(spec: T): void {
    this._addMarkLabelSpec(spec, SeriesMarkNameEnum.rose);
  }

  protected _getDefaultSpecFromChart(chartSpec: any): Partial<T> {
    const { outerRadius, innerRadius } = chartSpec;
    return { outerRadius, innerRadius } as Partial<T>;
  }
}
