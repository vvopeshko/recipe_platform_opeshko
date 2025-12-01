'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Plus, X, GripVertical, Upload } from 'lucide-react';
import { Recipe, Ingredient, Step, Category } from '@/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CATEGORIES, DIFFICULTY_OPTIONS, UNIT_OPTIONS } from '@/lib/constants';

const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  category_id: z.string().min(1, 'Category is required'),
  prep_time: z.string().optional(),
  cook_time: z.string().optional(),
  servings: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  ingredients: z.array(
    z.object({
      item: z.string().min(1, 'Ingredient name is required'),
      quantity: z.string().optional(),
      unit: z.string().optional(),
    })
  ).min(1, 'At least one ingredient is required'),
  steps: z.array(
    z.object({
      instruction: z.string().min(1, 'Step instruction is required'),
    })
  ).min(1, 'At least one step is required'),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  initialData?: Recipe & { ingredients?: Ingredient[]; steps?: Step[] };
  categories?: Category[];
  onSubmit: (data: RecipeFormData & { image?: File }) => Promise<void>;
  isLoading?: boolean;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData,
  categories = CATEGORIES,
  onSubmit,
  isLoading = false,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_url || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description || '',
          category_id: initialData.category_id,
          prep_time: initialData.prep_time?.toString() || '',
          cook_time: initialData.cook_time?.toString() || '',
          servings: initialData.servings?.toString() || '',
          difficulty: initialData.difficulty || undefined,
          ingredients:
            initialData.ingredients?.map((ing) => ({
              item: ing.item,
              quantity: ing.quantity || '',
              unit: ing.unit || '',
            })) || [{ item: '', quantity: '', unit: '' }],
          steps:
            initialData.steps
              ?.sort((a, b) => a.step_number - b.step_number)
              .map((step) => ({
                instruction: step.instruction,
              })) || [{ instruction: '' }],
        }
      : {
          ingredients: [{ item: '', quantity: '', unit: '' }],
          steps: [{ instruction: '' }],
        },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
    swap: swapIngredients,
  } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
    swap: swapSteps,
  } = useFieldArray({
    control,
    name: 'steps',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be 5MB or less');
        return;
      }
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        alert('Image must be JPG, PNG, or WebP');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = async (data: RecipeFormData) => {
    await onSubmit({ ...data, image: imageFile || undefined });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Input
        label="Title"
        {...register('title')}
        error={errors.title?.message}
        required
        maxLength={100}
      />

      <Textarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        rows={4}
        maxLength={500}
        helperText={`${watch('description')?.length || 0}/500 characters`}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image <span className="text-red-500">*</span>
        </label>
        <div className="space-y-4">
          {imagePreview && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300">
              <Image
                src={imagePreview}
                alt="Recipe preview"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors">
                <Upload className="w-4 h-4" />
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
                required={!initialData}
              />
            </label>
            {imagePreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                }}
              >
                Remove
              </Button>
            )}
          </div>
          {!imagePreview && !imageFile && <p className="text-sm text-red-600">Image is required</p>}
          <p className="text-xs text-gray-500">Max 5MB, JPG/PNG/WebP</p>
        </div>
      </div>

      <Select
        label="Category"
        options={[
          { value: '', label: 'Select a category' },
          ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
        ]}
        {...register('category_id')}
        error={errors.category_id?.message}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Prep Time (minutes)"
          type="number"
          {...register('prep_time')}
          error={errors.prep_time?.message}
        />
        <Input
          label="Cook Time (minutes)"
          type="number"
          {...register('cook_time')}
          error={errors.cook_time?.message}
        />
        <Input
          label="Servings"
          type="number"
          {...register('servings')}
          error={errors.servings?.message}
        />
      </div>

      <Select
        label="Difficulty"
        options={[
          { value: '', label: 'Select difficulty' },
          ...DIFFICULTY_OPTIONS,
        ]}
        {...register('difficulty')}
        error={errors.difficulty?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingredients <span className="text-red-500">*</span>
        </label>
        {errors.ingredients && (
          <p className="text-sm text-red-600 mb-2">{errors.ingredients.message}</p>
        )}
        <div className="space-y-3">
          {ingredientFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Quantity"
                  {...register(`ingredients.${index}.quantity`)}
                  error={errors.ingredients?.[index]?.quantity?.message}
                />
                <Select
                  placeholder="Unit"
                  options={UNIT_OPTIONS}
                  {...register(`ingredients.${index}.unit`)}
                />
                <Input
                  placeholder="Ingredient name"
                  {...register(`ingredients.${index}.item`)}
                  error={errors.ingredients?.[index]?.item?.message}
                />
              </div>
              {ingredientFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendIngredient({ item: '', quantity: '', unit: '' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Ingredient
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Steps <span className="text-red-500">*</span>
        </label>
        {errors.steps && (
          <p className="text-sm text-red-600 mb-2">{errors.steps.message}</p>
        )}
        <div className="space-y-3">
          {stepFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-gray-500 font-semibold">
                {index + 1}
              </div>
              <Textarea
                placeholder={`Step ${index + 1}`}
                {...register(`steps.${index}.instruction`)}
                error={errors.steps?.[index]?.instruction?.message}
                rows={2}
                className="flex-1"
              />
              {stepFields.length > 1 && (
                <div className="flex flex-col gap-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => swapSteps(index, index - 1)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <GripVertical className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendStep({ instruction: '' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Recipe' : 'Create Recipe'}
        </Button>
      </div>
    </form>
  );
};


