import { Step } from '@/types';

interface StepsListProps {
  steps: Step[];
}

export const StepsList: React.FC<StepsListProps> = ({ steps }) => {
  // Sort by step_number
  const sortedSteps = [...steps].sort((a, b) => a.step_number - b.step_number);

  if (sortedSteps.length === 0) {
    return <p className="text-gray-500">No steps listed.</p>;
  }

  return (
    <ol className="space-y-4">
      {sortedSteps.map((step) => (
        <li key={step.id} className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white font-semibold">
            {step.step_number}
          </span>
          <span className="flex-1 text-gray-700 pt-1">{step.instruction}</span>
        </li>
      ))}
    </ol>
  );
};


