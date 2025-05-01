"use client"

import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Plus, MapPin } from 'lucide-react';
import { GetLocal } from '~/components/local';
import Link from 'next/link';

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

const Page = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [distanceFilter, setDistanceFilter] = useState(0.5);
    const [sortOption, setSortOption] = useState('recent');
    const [filtersApplied, setFiltersApplied] = useState(false);
    const [appliedDistance, setAppliedDistance] = useState<number | undefined>(undefined);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleDistanceChange = (value: number[]) => {
        setDistanceFilter(value[0]);
    };

    const applyFilters = () => {
        setAppliedDistance(distanceFilter);
        setFiltersApplied(true);
    };

    const resetFilters = () => {
        setDistanceFilter(0.5);
        setAppliedDistance(undefined);
        setFiltersApplied(false);
    };

    useEffect(() => {
        if (filtersApplied) {
            setAppliedDistance(distanceFilter);
        }
    }, [searchQuery, filtersApplied]);

    const formatDistanceLabel = (distance: number) => {
        return distance < 1 
            ? `${Math.round(distance * 1000)}m` 
            : `${distance.toFixed(1)}km`;
    };

    return (
        <div className="w-full min-h-[calc(100vh-105px)] bg-background overflow-x-hidden">
            <div className="w-full from-primary/5 to-secondary/5 py-10 px-4 border-b border-accent/10">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Local Posts
                        <span className="inline-block ml-2 rounded-full px-3 py-1 bg-primary/10 text-primary text-sm align-middle">
                            Near You
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-3xl">
                        Connect with people who can provide the assistance you need, right where you need it.
                    </p>
                </div>
            </div>

            <div className="w-full bg-background py-4 px-4 mb-6 border-b border-accent/10 sticky top-[57px] z-40">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10">
                            <Search size={18} />
                        </div>
                        <Input 
                            type="text" 
                            placeholder="Search local posts..." 
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
                                            max={1.5}
                                            step={0.1}
                                            value={[distanceFilter]}
                                            onValueChange={handleDistanceChange}
                                        />
                                    </div>

                                    <div className="flex justify-between pt-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={resetFilters}
                                            disabled={!filtersApplied}
                                        >
                                            Reset
                                        </Button>
                                        <Button 
                                            variant="default" 
                                            size="sm"
                                            onClick={applyFilters}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Link href="/post">
                            <Button variant="default" className="flex items-center gap-2">
                                <Plus size={16} />
                                <span className="hidden sm:inline">New Post</span>
                                <span className="inline sm:hidden">Post</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-10">
                <div className="bg-white rounded-xl shadow-sm border border-accent/10 p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-accent/10">
                        <div>
                            <h2 className="font-semibold text-lg">Available posts</h2>
                            <p className="text-muted-foreground text-sm">
                                {filtersApplied 
                                    ? `Showing results within ${distanceFilter}km of your location`
                                    : "Showing all results in your area"}
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
                                    <SelectItem value="popularity">Popularity</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="w-full">
                        <GetLocal 
                            searchQuery={searchQuery}
                            distanceFilter={appliedDistance}
                            sortOption={sortOption}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;