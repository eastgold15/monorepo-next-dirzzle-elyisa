# MasterCategory Select 组件使用说明

## 组件介绍

MasterCategorySelect 是一个用于选择主分类的下拉选择器组件，支持树形结构展示和完整路径显示。

## 使用方法

### 基本使用

```tsx
import { MasterCategorySelect } from "@/components/mastercategory-select";

export default function MyComponent() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  return (
    <MasterCategorySelect
      value={selectedCategoryId}
      onValueChange={setSelectedCategoryId}
      placeholder="请选择主分类"
    />
  );
}
```

### 显示完整路径

```tsx
<MasterCategorySelect
  value={selectedCategoryId}
  onValueChange={setSelectedCategoryId}
  placeholder="请选择主分类"
  showFullPath
/>
```

## Props 说明

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| value | string | undefined | 当前选中的分类ID |
| onValueChange | (value: string) => void | undefined | 选中值改变时的回调函数 |
| placeholder | string | "选择主分类" | 占位符文本 |
| disabled | boolean | false | 是否禁用选择器 |
| className | string | undefined | 自定义CSS类名 |
| showFullPath | boolean | false | 是否显示完整路径（如：一级分类 > 二级分类） |

## 在表单中使用

```tsx
"use client";

import { useState } from "react";
import { MasterCategorySelect } from "@/components/mastercategory-select";
import { Button } from "@/components/ui/button";

export default function ProductForm() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  
  const handleSubmit = () => {
    // 处理表单提交
    console.log("Selected category ID:", selectedCategoryId);
  };

  return (
    <div>
      <MasterCategorySelect
        value={selectedCategoryId}
        onValueChange={setSelectedCategoryId}
        placeholder="请选择主分类"
        showFullPath
      />
      <Button onClick={handleSubmit}>提交</Button>
    </div>
  );
}
```

## 注意事项

1. 该组件会自动从API获取主分类数据并缓存到Zustand store中
2. 组件会根据分类层级自动添加缩进显示
3. 当showFullPath为true时，会显示分类的完整路径
4. 组件已经集成到RootProvider中，无需额外配置