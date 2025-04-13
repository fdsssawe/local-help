"use client"

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { api } from '~/trpc/react';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { ArrowLeft, MapPin } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { toast } from "~/components/hooks/use-toast";

// Form schema validation
const formSchema = z.object({
  type: z.enum(['lost', 'found']),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100),
  description: z.string().min(10, { message: "Please provide a detailed description" }),
  category: z.string().min(3, { message: "Please select or enter a category" }),
  location: z.string().min(3, { message: "Please enter the location where the item was lost/found" }),
  contactMethod: z.enum(['platform', 'custom']),
  contactInfo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Predefined categories
const PREDEFINED_CATEGORIES = [
  'Pet',
  'Keys',
  'Wallet',
  'Phone',
  'ID/Documents',
  'Electronics',
  'Clothing',
  'Jewelry',
  'Bag/Backpack',
  'Other'
];

export default function LostFoundPostPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'lost',
      title: '',
      description: '',
      category: '',
      location: '',
      contactMethod: 'platform',
      contactInfo: '',
    }
  });

  // Check if the user is logged in
  useEffect(() => {
    if (isLoaded && !user) {
      setShowLoginAlert(true);
    }
  }, [isLoaded, user]);

  // Get current location
  useEffect(() => {
    if (typeof window !== "undefined" && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ latitude, longitude });
      });
    }
  }, []);

  // Create mutation for lost/found item
  const createItem = api.lostFound.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your item has been posted.",
      });
      router.push('/lost-found');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post your item. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    if (!user) {
      setShowLoginAlert(true);
      return;
    }

    if (!location) {
      toast({
        title: "Location required",
        description: "Please allow location access to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Only include contactInfo if the contactMethod is custom
    const contactInfo = data.contactMethod === 'custom' ? data.contactInfo : undefined;

    createItem.mutate({
      type: data.type,
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      contactMethod: data.contactMethod,
      contactInfo,
    });
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    if (value === 'custom') {
      // Don't set the form value yet, we'll set it when the custom category is entered
      setCustomCategory('');
    } else {
      form.setValue('category', value);
    }
  };

  // Handle custom category input
  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomCategory(value);
    form.setValue('category', value);
  };

  return (
    <div className="min-h-screen bg-background pt-[56px] pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()} 
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Post a Lost or Found Item</CardTitle>
            <CardDescription>
              Share details about an item you&apos;ve lost or found to connect with your community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Item Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>What are you posting?</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          defaultValue={field.value} 
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="lost" id="lost" />
                            <Label htmlFor="lost" className="font-normal">I lost an item</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="found" id="found" />
                            <Label htmlFor="found" className="font-normal">I found an item</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Item Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Blue Backpack, Gold Ring, Brown Wallet" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear, brief title to identify the item
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={handleCategoryChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PREDEFINED_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                          <SelectItem value="custom">Other (specify)</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* Custom category input */}
                      {form.watch('category') === customCategory && customCategory !== '' && (
                        <Input 
                          placeholder="Enter custom category"
                          value={customCategory}
                          onChange={handleCustomCategoryChange}
                          className="mt-2"
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <div className="flex items-start gap-2">
                        <FormControl className="flex-grow">
                          <Input 
                            placeholder="e.g., Central Park, Main St & 5th Ave" 
                            {...field} 
                          />
                        </FormControl>
                        <div className={`
                          rounded p-2 flex-shrink-0 h-10 w-10 flex items-center justify-center
                          ${location ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}
                        `}>
                          <MapPin size={18} />
                        </div>
                      </div>
                      <FormDescription>
                        {location 
                          ? "Your current location will be used to help people find this item"
                          : "Please enable location services"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please provide details about the item. Include distinguishing features, when/where it was lost or found, and any other relevant information."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Method */}
                <FormField
                  control={form.control}
                  name="contactMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>How should people contact you?</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="platform" id="platform" />
                            <Label htmlFor="platform" className="font-normal">
                              Through this platform (recommended)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom" className="font-normal">
                              Custom contact info
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Custom Contact Info */}
                {form.watch('contactMethod') === 'custom' && (
                  <FormField
                    control={form.control}
                    name="contactInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Information</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Phone number, email, etc."
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          This information will be visible to all users
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Location Warning */}
                {!location && (
                  <Alert variant="warning" className="mt-4">
                    <MapPin className="h-4 w-4" />
                    <AlertTitle>Location required</AlertTitle>
                    <AlertDescription>
                      You need to enable location services to post a lost or found item.
                      This helps connect items with their owners in your local area.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !location}
                >
                  {isSubmitting ? "Posting..." : "Post Item"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Login Alert Dialog */}
      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to post a lost or found item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.push('/lost-found')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/sign-in')}>
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}