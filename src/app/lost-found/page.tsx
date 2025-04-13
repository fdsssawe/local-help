"use client"

import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Plus, MapPin, Filter, User } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';

// Import shadcn components
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Spinner from "~/components/ui/spinner";

const LostFoundPage = () => {
    // State for search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [distanceFilter, setDistanceFilter] = useState(1.0); // Default 1km radius
    const [appliedDistance, setAppliedDistance] = useState(1.0); 
    const [sortOption, setSortOption] = useState('recent');
    const [filtersApplied, setFiltersApplied] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [useRegisteredAddress, setUseRegisteredAddress] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "lost" | "found">("all");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const [filteredItems, setFilteredItems] = useState<any[]>([]);

    // Get user's registered address
    const { data: userAddress } = api.address.getUserAddress.useQuery(undefined, {
        enabled: !!user,
    });

    // Get available categories
    const { data: categories } = api.lostFound.getCategories.useQuery();

    // Set to use registered address only if one exists
    useEffect(() => {
        if (userAddress) {
            setUseRegisteredAddress(true);
        }
    }, [userAddress]);

    // Get browser location
    useEffect(() => {
        if (typeof window !== "undefined" && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    const { latitude, longitude } = coords;
                    setLocation({ latitude, longitude });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocation(null);
                }
            );
        }
    }, []);

    // Determine which coordinates to use
    const queryParams = {
        latitude: location?.latitude.toString() ?? "0",
        longitude: location?.longitude.toString() ?? "0",
        useRegisteredAddress: useRegisteredAddress && !!userAddress,
        maxDistance: appliedDistance,
        type: activeTab !== "all" ? activeTab : undefined,
        category: selectedCategory ?? undefined,
    };

    // Fetch nearby items
    const { data: nearbyItems, isLoading } = api.lostFound.getNearbyItems.useQuery(
        queryParams,
        {
            enabled: !!location ?? (!!userAddress && useRegisteredAddress),
            retry: 1,
            refetchOnWindowFocus: false,
        }
    );

    // Update filtered items when search changes
    useEffect(() => {
        if (!nearbyItems?.rows) return;
        
        let items = [...nearbyItems.rows];
        
        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item => 
                item.title?.toLowerCase().includes(query) ?? 
                item.description?.toLowerCase().includes(query) ??
                item.category?.toLowerCase().includes(query) ??
                item.location?.toLowerCase().includes(query)
            );
        }
        
        // Apply sorting
        if (sortOption) {
            switch (sortOption) {
                case 'recent':
                    items.sort((a, b) => {
                        return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
                    });
                    break;
                case 'distance':
                    items.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
                    break;
            }
        }
        
        setFilteredItems(items);
    }, [nearbyItems, searchQuery, sortOption]);

    // Handle search input changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // Handle distance slider changes
    const handleDistanceChange = (values: number[]) => {
        setDistanceFilter(values[0]);
    };

    // Apply filters
    const applyFilters = () => {
        setAppliedDistance(distanceFilter);
        setFiltersApplied(true);
    };

    // Reset filters
    const resetFilters = () => {
        setDistanceFilter(1.0);
        setAppliedDistance(1.0);
        setFiltersApplied(false);
        setSelectedCategory(null);
    };

    // Format distance for display
    const formatDistance = (distance: number | undefined) => {
        if (typeof distance !== "number") return "Unknown distance";
        
        if (distance < 1) {
            return `${Math.round(distance * 1000)}m`; // Show as meters
        } else {
            return `${distance.toFixed(1)}km`; // Show as kilometers with one decimal
        }
    };

    // Format distance label for the slider
    const formatDistanceLabel = (value: number) => {
        if (value < 1) {
            return `${Math.round(value * 1000)}m`;
        } else {
            return `${value.toFixed(1)}km`;
        }
    };

    // Format date
    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // Determine the icon and color for each type
    const getTypeDetails = (type: string) => {
        if (type === "lost") {
            return { 
                label: "Lost", 
                badgeVariant: "destructive" as const,
            };
        } else {
            return { 
                label: "Found", 
                badgeVariant: "success" as const,
            };
        }
    };

    return (
        <div className="min-h-screen bg-background pt-[56px]">
            {/* Hero section */}
            <div className="w-full bg-gradient-to-br from-primary/20 to-secondary/20 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-3">Lost & Found</h1>
                    <p className="text-lg text-muted-foreground mb-6">
                        Lost something or found an item? Connect with your local community to help return lost items.
                    </p>
                </div>
            </div>

            {/* Search and filters section */}
            <div className="w-full bg-background py-4 px-4 mb-6 border-b border-accent/10 sticky top-[57px] z-40">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10">
                            <Search size={18} />
                        </div>
                        <Input 
                            type="text" 
                            placeholder="Search lost & found items..." 
                            className="w-full pl-10"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto justify-between md:justify-end">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <SlidersHorizontal size={16} />
                                    <span>Filters</span>
                                    {filtersApplied && 
                                        <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary">1</Badge>
                                    }
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 z-50">
                                <div className="space-y-4">
                                    <h4 className="font-medium">Filters</h4>
                                    <Separator />
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={16} className="text-primary" />
                                                    <span>Distance</span>
                                                </div>
                                            </label>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDistanceLabel(distanceFilter)}
                                            </span>
                                        </div>
                                        <Slider
                                            defaultValue={[distanceFilter]}
                                            min={0.1}
                                            max={3.0}
                                            step={0.1}
                                            value={[distanceFilter]}
                                            onValueChange={handleDistanceChange}
                                            className="py-4"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>100m</span>
                                            <span>1.5km</span>
                                            <span>3km</span>
                                        </div>
                                    </div>

                                    {categories && categories.length > 0 && (
                                        <>
                                            <Separator />
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-1">
                                                    <Filter size={16} className="text-primary" />
                                                    <span>Category</span>
                                                </label>
                                                <Select 
                                                    value={selectedCategory ?? "all"}
                                                    onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="All categories" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All categories</SelectItem>
                                                        {categories?.map((category) => (
                                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}

                                    <Separator />
                                    
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={resetFilters}>
                                            Reset
                                        </Button>
                                        <Button size="sm" onClick={applyFilters}>
                                            Apply Filters
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        
                        {user && (
                            <Link href="/lost-found/my-items">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <User size={16} />
                                    <span>My Items</span>
                                </Button>
                            </Link>
                        )}
                        
                        <Link href="/lost-found/post">
                            <Button className="flex items-center gap-2">
                                <Plus size={16} />
                                <span>New Post</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main content section */}
            <div className="max-w-6xl w-full mx-auto pb-16 px-4">
                <div className="w-full">
                    {user && (
                        <div className="flex items-center justify-between px-4 py-4 bg-secondary/10 rounded-lg mb-5">
                            <div className="text-left">
                                <h3 className="font-semibold">Location Mode</h3>
                                <p className="text-sm text-muted-foreground">
                                    {useRegisteredAddress && userAddress
                                        ? "Using your registered address"
                                        : "Using your current location"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs">Current</span>
                                <Switch 
                                    checked={useRegisteredAddress} 
                                    onCheckedChange={setUseRegisteredAddress} 
                                    disabled={!userAddress}
                                />
                                <span className="text-xs">Registered</span>
                            </div>
                        </div>
                    )}

                    {!user && !location && (
                        <Card className="bg-amber-50 mb-5 border-amber-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-amber-700 text-lg">Location Access</CardTitle>
                                <CardDescription className="text-amber-600">
                                    Allow location access to see lost & found items near you
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )}

                    {user && !userAddress && (
                        <Card className="bg-secondary/10 mb-5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Set your home address</CardTitle>
                                <CardDescription>
                                    Register your address to see lost & found items in your neighborhood even when you&apos;re away
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-2 justify-end">
                                <Button onClick={() => router.push("/account/address")}>
                                    Set Address
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-accent/10 p-4 md:p-6">
                        {/* Results stats and sort options */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                            <div>
                                <h2 className="font-semibold text-lg">Lost & Found Items</h2>
                                <p className="text-muted-foreground text-sm">
                                    {filtersApplied 
                                        ? `Showing items within ${appliedDistance}km of your location`
                                        : "Showing all items in your area"}
                                    {searchQuery && ` matching "${searchQuery}"`}
                                </p>
                            </div>
                            
                            <div className="mt-3 sm:mt-0">
                                <Select 
                                    defaultValue={sortOption}
                                    onValueChange={(value) => setSortOption(value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-50">
                                        <SelectItem value="recent">Most recent</SelectItem>
                                        <SelectItem value="distance">Distance (near to far)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        {/* Tabs for All/Lost/Found */}
                        <div className="mb-6">
                            <Tabs 
                                defaultValue="all" 
                                value={activeTab}
                                onValueChange={(value) => setActiveTab(value as "all" | "lost" | "found")}
                                className="w-full"
                            >
                                <TabsList className="w-full max-w-md">
                                    <TabsTrigger value="all">All Items</TabsTrigger>
                                    <TabsTrigger value="lost">Lost Items</TabsTrigger>
                                    <TabsTrigger value="found">Found Items</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        
                        {/* Lost and found items list */}
                        <div className="w-full">
                            {isLoading ?? (!location && !userAddress) ? (
                                <div className="w-full h-40 flex justify-center items-center">
                                    <Spinner size="10" className="text-primary" />
                                </div>
                            ) : filteredItems.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredItems.map((item) => {
                                        const typeDetails = getTypeDetails(item.type);
                                        
                                        return (
                                            <Card key={item.id} className="h-full flex flex-col group hover:shadow-md transition-shadow">
                                                <div 
                                                    className="cursor-pointer flex flex-col h-full" 
                                                    onClick={() => router.push(`/lost-found/${item.id}`)}
                                                >
                                                    <CardHeader className="pb-2">
                                                        <div className="flex justify-between items-start">
                                                            <CardTitle className="text-lg pr-2">{item.title}</CardTitle>
                                                            <Badge variant={typeDetails.badgeVariant}>
                                                                {typeDetails.label}
                                                            </Badge>
                                                        </div>
                                                        {item.category && (
                                                            <Badge variant="outline" className="mt-1 w-fit">
                                                                {item.category}
                                                            </Badge>
                                                        )}
                                                    </CardHeader>
                                                    
                                                    <CardContent className="pb-2 flex-grow">
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                            {item.description}
                                                        </p>
                                                        
                                                        <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-2">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin size={12} className="flex-shrink-0" />
                                                                <span className="truncate">{item.location}</span>
                                                            </div>
                                                            {item.distance && (
                                                                <div className="flex items-center gap-1 text-primary text-xs">
                                                                    <span>{formatDistance(item.distance)} from you</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                    
                                                    <CardFooter className="pt-2 text-xs text-muted-foreground border-t">
                                                        Posted {formatDate(item.createdAt ?? item.created_at)}
                                                    </CardFooter>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-secondary/10 rounded-lg">
                                    <MapPin size={48} className="text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">No items found</h3>
                                    <p className="text-muted-foreground max-w-md mb-6">
                                        {searchQuery 
                                            ? `No results found for "${searchQuery}"` 
                                            : activeTab !== "all" 
                                                ? `No ${activeTab} items found in your area` 
                                                : "There are no lost & found items in your area."}
                                        {appliedDistance ? ` within ${appliedDistance}km.` : ""}
                                    </p>
                                    <Button variant="default" onClick={() => router.push("/lost-found/post")}>
                                        Post an Item
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LostFoundPage;