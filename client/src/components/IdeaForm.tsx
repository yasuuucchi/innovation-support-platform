import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { Idea } from "@/types";

interface IdeaFormProps {
  onSuccess: (idea: Idea) => void;
}

export default function IdeaForm({ onSuccess }: IdeaFormProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      targetCustomer: "",
      priceRange: "",
      value: "",
      competitors: "",
    },
  });

  const createIdea = useMutation({
    mutationFn: async (data: Partial<Idea>) => {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create idea");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Your idea has been created",
      });
      onSuccess(data);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create idea",
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => createIdea.mutate(data))}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idea Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your idea name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetCustomer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Customer</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Who is your target customer?" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priceRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Range</FormLabel>
              <FormControl>
                <Input {...field} placeholder="What is your price range?" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value Proposition</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="What value do you provide?"
                  className="h-20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="competitors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Competitors</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Who are your competitors?"
                  className="h-20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={createIdea.isPending}
        >
          {createIdea.isPending ? "Creating..." : "Create Idea"}
        </Button>
      </form>
    </Form>
  );
}
