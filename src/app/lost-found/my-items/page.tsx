"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { api } from '~/trpc/react';
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ArrowLeft, Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Spinner from '~/components/ui/spinner';

export default function MyLostFoundItemsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved" | "expired">("active");
  const [typeFilter, setTypeFilter] = useState<"all" | "lost" | "found">("all");

  // Redirect if not logged in
  if (isLoaded && !user) {
    router.push('/sign-in');
    return null;
  }

  // Fetch user's items
  const { data: items, isLoading } = api.lostFound.getUserItems.useQuery(
    { 
      status: statusFilter,
      type: typeFilter 
    },
    {
      enabled: !!user,
    }
  );

  // Format date function
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get type and status details
  const getTypeDetails = (type: string) => {
    if (type === "lost") {
      return { label: "Lost", variant: "destructive" as const };
    } else {
      return { label: "Found", variant: "success" as const };
    }
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Active", variant: "default" as const };
      case "resolved":
        return { label: "Resolved", variant: "success" as const };
      case "expired":
        return { label: "Expired", variant: "secondary" as const };
      default:
        return { label: status, variant: "outline" as const };
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/lost-found')} 
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Lost & Found
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Lost & Found Items</h1>
            <p className="text-muted-foreground">
              Manage your lost and found listings
            </p>
          </div>

          <Link href="/lost-found/post">
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Post New Item
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Type</CardTitle>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <Tabs 
                  defaultValue="all" 
                  value={typeFilter}
                  onValueChange={(v) => setTypeFilter(v as "all" | "lost" | "found")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="lost">Lost</TabsTrigger>
                    <TabsTrigger value="found">Found</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <Tabs 
                  defaultValue="active" 
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as "all" | "active" | "resolved" | "expired")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                    <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
                    <TabsTrigger value="resolved" className="text-xs sm:text-sm">Resolved</TabsTrigger>
                    <TabsTrigger value="expired" className="text-xs sm:text-sm">Expired</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Items list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="12" className="text-primary" />
          </div>
        ) : !items || items.length === 0 ? (
          <div className="text-center py-16 bg-secondary/10 rounded-lg">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No items found</h2>
            <p className="text-muted-foreground mb-6">
              {typeFilter !== "all" && statusFilter !== "all" 
                ? `You don't have any ${typeFilter} items with status "${statusFilter}"`
                : typeFilter !== "all"
                ? `You don't have any ${typeFilter} items`
                : statusFilter !== "all"
                ? `You don't have any items with status "${statusFilter}"`
                : "You haven't posted any lost or found items yet"}
            </p>
            <Link href="/lost-found/post">
              <Button>Post Your First Item</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => {
              const typeDetails = getTypeDetails(item.type);
              const statusDetails = getStatusDetails(item.status);
              
              return (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/lost-found/${item.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={typeDetails.variant}>{typeDetails.label}</Badge>
                      <Badge variant={statusDetails.variant}>{statusDetails.label}</Badge>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription>{item.location}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="text-sm text-muted-foreground border-t pt-3">
                    Posted on {formatDate(item.createdAt)}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}