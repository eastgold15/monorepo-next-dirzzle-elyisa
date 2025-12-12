"use client";

import { SignupForm } from "@/components/signup-form";

export default function TestAvatarPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold">测试头像上传功能</h1>
        <SignupForm />
      </div>
    </div>
  );
}