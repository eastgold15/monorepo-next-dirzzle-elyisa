// // src/errors/base.ts
// export class CustomError extends Error {
//   status: number;
//   originalError?: unknown;
//   timestamp: string;
//   context?: Record<string, any>;

//   constructor(
//     message: string,
//     status = 500,
//     originalError?: unknown,
//     context?: Record<string, any>
//   ) {
//     super(message);
//     this.name = this.constructor.name;
//     this.status = status;
//     this.originalError = originalError;
//     this.timestamp = new Date().toISOString();
//     this.context = context;

//     // 确保错误堆栈正确捕获
//     if (Error.captureStackTrace) {
//       Error.captureStackTrace(this, this.constructor);
//     }

//     // 如果有原始错误，尝试保留其堆栈
//     if (originalError && originalError instanceof Error) {
//       this.stack = this.mergeStacks(this.stack, originalError.stack);
//     }

//     // 修复 TypeScript 原型链问题
//     Object.setPrototypeOf(this, new.target.prototype);
//   }

//   /**
//    * 合并两个错误堆栈
//    */
//   private mergeStacks(currentStack?: string, originalStack?: string): string {
//     if (!originalStack) return currentStack || "";
//     if (!currentStack) return originalStack;

//     const currentLines = currentStack.split("\n");
//     const originalLines = originalStack.split("\n");

//     // 移除重复的错误行
//     const mergedLines = [...currentLines];
//     const firstOriginalLine = originalLines.find((line) => line.trim());

//     if (firstOriginalLine && !mergedLines.includes(firstOriginalLine)) {
//       mergedLines.push("\n--- Caused by: ---");
//       mergedLines.push(...originalLines);
//     }

//     return mergedLines.join("\n");
//   }

//   /**
//    * 获取格式化的错误信息（开发环境使用）
//    */
//   getFormattedError(): {
//     name: string;
//     message: string;
//     status: number;
//     timestamp: string;
//     stack?: string;
//     context?: Record<string, any>;
//     originalError?: any;
//   } {
//     return {
//       name: this.name,
//       message: this.message,
//       status: this.status,
//       timestamp: this.timestamp,
//       stack: this.stack,
//       context: this.context,
//       originalError:
//         this.originalError instanceof Error
//           ? {
//               name: this.originalError.name,
//               message: this.originalError.message,
//               stack: this.originalError.stack,
//             }
//           : this.originalError,
//     };
//   }

//   /**
//    * 获取安全的错误信息（生产环境使用）
//    */
//   getSafeError(): {
//     name: string;
//     message: string;
//     status: number;
//     timestamp: string;
//   } {
//     return {
//       name: this.name,
//       message: this.message,
//       status: this.status,
//       timestamp: this.timestamp,
//     };
//   }

//   /**
//    * 转换为 JSON 序列化格式
//    */
//   toJSON(): {
//     name: string;
//     message: string;
//     status: number;
//     timestamp: string;
//     stack?: string;
//     context?: Record<string, any>;
//   } {
//     return {
//       name: this.name,
//       message: this.message,
//       status: this.status,
//       timestamp: this.timestamp,
//       stack: this.stack,
//       context: this.context,
//     };
//   }

//   /**
//    * 从现有错误创建 CustomError
//    */
//   static fromError(
//     error: Error,
//     status = 500,
//     context?: Record<string, any>
//   ): CustomError {
//     return new CustomError(error.message, status, error, context);
//   }
// }
