"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

const searchFormSchema = z.object({
  query: z.string(),
});

type SearchFormSchema = z.infer<typeof searchFormSchema>;

interface SearchFormProps extends React.HTMLAttributes<HTMLFormElement> {
  placeholder?: string;
  onSearch: (query: string) => void;
  initialQuery?: string;
  showClearButton?: boolean;
  className?: string;
  inputClassName?: string;
  autoSubmit?: boolean;
  autoSubmitDelay?: number;
  buttonLabel?: string;
}

export function SearchForm({
  placeholder = "Search...",
  onSearch,
  initialQuery = "",
  showClearButton = true,
  className,
  inputClassName,
  autoSubmit = false,
  autoSubmitDelay = 500,
  buttonLabel = "Search",
  ...props
}: SearchFormProps) {
  const form = useForm<SearchFormSchema>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: initialQuery,
    },
  });

  const debouncedSubmit = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    // Update form when initialQuery changes externally
    if (initialQuery !== form.getValues().query) {
      form.reset({ query: initialQuery });
    }
  }, [initialQuery, form]);

  // Handle search submission
  function handleSubmit(data: SearchFormSchema) {
    onSearch(data.query);
  }

  // Clear search
  function handleClear() {
    form.reset({ query: "" });
    onSearch("");
  }

  // Set up auto-submit if enabled
  React.useEffect(() => {
    if (autoSubmit) {
      const subscription = form.watch((values) => {
        if (debouncedSubmit.current) {
          clearTimeout(debouncedSubmit.current);
        }
        
        debouncedSubmit.current = setTimeout(() => {
          if (values.query !== undefined) {
            onSearch(values.query);
          }
        }, autoSubmitDelay);
      });
      
      return () => {
        subscription.unsubscribe();
        if (debouncedSubmit.current) {
          clearTimeout(debouncedSubmit.current);
        }
      };
    }
  }, [form, onSearch, autoSubmit, autoSubmitDelay]);

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex items-center space-x-2", className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    {...field}
                    placeholder={placeholder}
                    className={cn(
                      "pl-9 pr-9", 
                      showClearButton && field.value && "pr-9",
                      inputClassName
                    )}
                  />
                </FormControl>
                {showClearButton && field.value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={handleClear}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
              </div>
            </FormItem>
          )}
        />
        {!autoSubmit && (
          <Button type="submit">
            {buttonLabel}
          </Button>
        )}
      </form>
    </Form>
  );
}