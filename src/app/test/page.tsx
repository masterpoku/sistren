'use client';

import { Button } from '@/components/ui/button';
import { Student, GraduationCap, Calculator } from '@phosphor-icons/react';

export default function TestPage() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Component Test</h1>

      <div className="flex flex-wrap gap-4">
        <Button>
          <Student size={20} weight="fill" />
          Test Button with Icon
        </Button>

        <Button variant="outline">
          <GraduationCap size={20} />
          Outline
        </Button>

        <Button variant="ghost">
          <Calculator size={20} weight="bold" />
          Ghost
        </Button>

        <Button variant="secondary">
          <GraduationCap size={20} weight="duotone" />
          Secondary
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Icon Sizes</h2>
          <div className="flex items-center gap-4">
            <Student size={16} />
            <Student size={20} />
            <Student size={24} />
            <Student size={32} />
          </div>
        </div>
      </div>
    </div>
  );
}
