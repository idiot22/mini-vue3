import { extend } from "@vue/shared";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

// 渲染时用到的所有方法
export const renderOptions = extend({patchProp}, nodeOps)

// runtime-dom是为了解决平台差异