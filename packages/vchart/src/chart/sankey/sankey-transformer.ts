import type { ISeriesSpec } from '../../typings';
import { BaseChartSpecTransformer } from '../base';
import type { ISankeyChartSpec } from './interface';

export class SankeyChartSpecTransformer<
  T extends ISankeyChartSpec = ISankeyChartSpec
> extends BaseChartSpecTransformer<T> {
  protected _getDefaultSeriesSpec(spec: T): any {
    const series: any = {
      ...super._getDefaultSeriesSpec(spec),
      categoryField: spec.categoryField,
      valueField: spec.valueField,
      sourceField: spec.sourceField,
      targetField: spec.targetField,

      direction: spec.direction,
      nodeAlign: spec.nodeAlign,
      crossNodeAlign: spec.crossNodeAlign,
      nodeGap: spec.nodeGap,
      nodeWidth: spec.nodeWidth,
      linkWidth: spec.linkWidth,
      minStepWidth: spec.minStepWidth,
      minNodeHeight: spec.minNodeHeight,
      maxNodeHeight: spec.maxNodeHeight,
      minLinkHeight: spec.minLinkHeight,
      maxLinkHeight: spec.maxLinkHeight,
      dropIsolatedNode: spec.dropIsolatedNode,
      nodeHeight: spec.nodeHeight,
      linkHeight: spec.linkHeight,
      equalNodeHeight: spec.equalNodeHeight,
      linkOverlap: spec.linkOverlap,
      iterations: spec.iterations,
      nodeKey: spec.nodeKey,
      linkSortBy: spec.linkSortBy,
      nodeSortBy: spec.nodeSortBy,
      setNodeLayer: spec.setNodeLayer,

      node: spec.node,
      link: spec.link,
      label: spec.label,

      emphasis: spec.emphasis,
      inverse: spec.inverse
    };
    const seriesType = this.seriesType;
    if (seriesType) {
      series.type = seriesType;
      series[seriesType] = spec[seriesType];
    }

    return series;
  }

  transformSpec(spec: T): void {
    super.transformSpec(spec);
    this.transformSeriesSpec(spec);
  }
}
