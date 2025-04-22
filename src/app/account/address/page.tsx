"use client";

import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/trpc/react';
import { toast } from '~/components/hooks/use-toast';
import { Search } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '~/components/ui/drawer';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "~/components/ui/dialog";
import { MapPin, CheckCircle2, XCircle } from "lucide-react";

export default function AddressPage() {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLong, setManualLong] = useState('');
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationLocation, setVerificationLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Define interface for geocoding results
  interface GeocodingResult {
    display_name: string;
    lat: string;
    lon: string;
    [key: string]: unknown;
  }
  
  const [geocodeResults, setGeocodeResults] = useState<GeocodingResult[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Add state to track if we have searched/selected coordinates
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ latitude: string; longitude: string } | null>(null);

  // Get the current user's address if any
  const { data: userAddress, refetch } = api.address.getUserAddress.useQuery();
  
  // Set address mutation
  const { mutate: setUserAddress, isPending } = api.address.setAddress.useMutation({
    onSuccess: () => {
      toast({
        title: "Address saved",
        description: "Your home address has been saved successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save your address",
        variant: "destructive",
      });
    }
  });

  // Verify address mutation
  const { mutate: verifyUserAddress, isPending: isVerifying } = api.address.verifyAddress.useMutation({
    onSuccess: (data) => {
      setVerificationStatus('success');
      setVerificationMessage(data.message || "Your address has been successfully verified!");
      refetch();
    },
    onError: (error) => {
      setVerificationStatus('error');
      setVerificationMessage(error.message || "Verification failed. Please try again when you're at your registered address.");
    }
  });

  // Get current location on page load
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          setLocation({ latitude, longitude });
          
          // Don't get address from coordinates if we already have an address
          if (!address) {
            fetchAddressFromCoordinates(latitude, longitude);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocation(null);
        }
      );
    }
  }, [address]);

  // Update fields if user has an address
  useEffect(() => {
    if (userAddress) {
      setAddress(userAddress.address);
      setManualLat(userAddress.latitude);
      setManualLong(userAddress.longitude);
      // Also set these as selected coordinates
      setSelectedCoordinates({
        latitude: userAddress.latitude,
        longitude: userAddress.longitude
      });
    }
  }, [userAddress]);

  // Search for address and get coordinates
  const searchAddress = async () => {
    if (!address) return;

    setIsGeocodingLoading(true);
    try {
      // Using Nominatim OpenStreetMap API (free, but has usage limits)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      
      const data = await response.json();
      setGeocodeResults(Array.isArray(data) ? data : []);
      setDrawerOpen(true);
      
      if (data.length === 0) {
        toast({
          title: "Address not found",
          description: "We couldn't find coordinates for this address. Try entering a more specific address.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      toast({
        title: "Geocoding failed",
        description: "There was a problem finding your address coordinates. Please try again or enter coordinates manually.",
        variant: "destructive"
      });
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  interface ReverseGeocodingResult {
    display_name: string;
    [key: string]: unknown;
  }

  // Get address from coordinates (reverse geocoding)
  const fetchAddressFromCoordinates = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      
      const data = await response.json() as ReverseGeocodingResult;
      if (data?.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  // Select an address from geocoding results
  const selectAddress = (result: GeocodingResult) => {
    setAddress(result.display_name);
    const lat = String(result.lat);
    const lon = String(result.lon);
    
    // Update manual coordinates
    setManualLat(lat);
    setManualLong(lon);
    
    // Store the selected coordinates
    setSelectedCoordinates({
      latitude: lat,
      longitude: lon
    });
    
    // Close the drawer
    setDrawerOpen(false);
    
    // Show confirmation to the user
    toast({
      title: "Address selected",
      description: "The address coordinates have been updated.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast({
        title: "Missing information",
        description: "Please enter your address",
        variant: "destructive",
      });
      return;
    }

    // Determine which coordinates to use with this priority:
    // 1. Selected coordinates from search (if exists)
    // 2. Manual entry coordinates (if manual entry is checked)
    // 3. Browser location coordinates
    let latitude, longitude;
    
    if (selectedCoordinates) {
      // Use selected coordinates if available (from search)
      latitude = selectedCoordinates.latitude;
      longitude = selectedCoordinates.longitude;
    } else if (isManualEntry) {
      // Use manual entry if checked
      latitude = manualLat;
      longitude = manualLong;
    } else if (location) {
      // Fall back to browser location
      latitude = location.latitude.toString();
      longitude = location.longitude.toString();
    } else {
      // No coordinates available
      latitude = '';
      longitude = '';
    }

    // Final validation
    if (!latitude || !longitude) {
      toast({
        title: "Missing location",
        description: "We couldn't get your location. Please search for your address, enable location services, or enter coordinates manually.",
        variant: "destructive",
      });
      return;
    }

    // Clear selectedCoordinates after submission to prevent unwanted reuse
    setUserAddress({
      address,
      latitude,
      longitude,
    });
    
    // Log what's being submitted for debugging
    console.log("Submitting coordinates:", { address, latitude, longitude });
  };

  // Reset selected coordinates when address changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    // Clear selected coordinates when user edits the address manually
    if (selectedCoordinates) {
      setSelectedCoordinates(null);
    }
  };

  // Start verification process
  const handleStartVerification = () => {
    setVerificationDialogOpen(true);
    setVerificationStatus('checking');
    setVerificationMessage('Checking your current location...');
    setVerificationLocation(null);
    
    // Get user's current location for verification
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          setVerificationLocation({ latitude, longitude });
          
          // Attempt to verify using current location
          verifyUserAddress({
            currentLatitude: latitude.toString(),
            currentLongitude: longitude.toString()
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setVerificationStatus('error');
          setVerificationMessage("Couldn't access your location. Please enable location services and try again.");
        },
        { enableHighAccuracy: true } // Request high accuracy for better verification
      );
    } else {
      setVerificationStatus('error');
      setVerificationMessage("Location services are not available in your browser.");
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Your Home Address</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Set your home address</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={handleAddressChange}
                    placeholder="Enter your full address"
                  />
                </div>
                <div className="pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-full"
                    onClick={searchAddress} 
                    disabled={isGeocodingLoading || !address}
                  >
                    {isGeocodingLoading ? (
                      <span className="animate-spin">↻</span>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="manual"
                  checked={isManualEntry}
                  onChange={(e) => {
                    setIsManualEntry(e.target.checked);
                    // Clear selected coordinates when switching to manual
                    if (e.target.checked) {
                      setSelectedCoordinates(null);
                    }
                  }}
                />
                <Label htmlFor="manual">Enter coordinates manually</Label>
              </div>

              {isManualEntry ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      value={manualLat}
                      onChange={(e) => {
                        setManualLat(e.target.value);
                        setSelectedCoordinates(null); // Clear selected when manual changes
                      }}
                      placeholder="e.g. 51.509865"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      value={manualLong}
                      onChange={(e) => {
                        setManualLong(e.target.value);
                        setSelectedCoordinates(null); // Clear selected when manual changes
                      }}
                      placeholder="e.g. -0.118092"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label>Current Location</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    {selectedCoordinates ? (
                      <div className="p-2 bg-secondary text-text rounded">
                        <p className="font-medium text-text">Using searched coordinates:</p>
                        <p>Lat: {Number(selectedCoordinates.latitude).toFixed(6)}, Long: {Number(selectedCoordinates.longitude).toFixed(6)}</p>
                      </div>
                    ) : location ? (
                      <div className="p-2 bg-secondary/20 rounded">
                        <p>Using browser location:</p>
                        <p>Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}</p>
                      </div>
                    ) : (
                      "Obtaining your location..."
                    )}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isPending || (!selectedCoordinates && !location && !isManualEntry)}
              >
                {isPending ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </form>
        </CardContent>
        {userAddress && !userAddress.verified && (
          <CardFooter className="border-t p-4 flex flex-col items-start">
            <div className="flex flex-col space-y-2 w-full">
              <div className="flex items-center justify-between w-full">
                <span className="text-amber-500 font-medium">Address not verified</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleStartVerification}
                  disabled={isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Verify Address"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                To verify, you need to be physically present at your registered address.
              </p>
            </div>
          </CardFooter>
        )}
      </Card>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTitle hidden>Search Results</DrawerTitle>
        <DrawerContent>
          <div className="p-4 max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-medium mb-2">Select your address</h3>
            {geocodeResults.length > 0 ? (
              <div className="space-y-2">
                {geocodeResults.map((result, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-md hover:bg-secondary/20 cursor-pointer"
                    onClick={() => selectAddress(result)}
                  >
                    <p>{result.display_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Lat: {parseFloat(String(result.lat)).toFixed(6)}, 
                      Lon: {parseFloat(String(result.lon)).toFixed(6)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No results found</p>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Add the verification dialog */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Address Verification</DialogTitle>
            <DialogDescription>
              We&apos;re checking if your current location matches your registered address.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 flex flex-col items-center justify-center text-center">
            {verificationStatus === 'checking' && (
              <>
                <div className="animate-pulse bg-primary/20 rounded-full p-6 mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <p>{verificationMessage}</p>
              </>
            )}
            
            {verificationStatus === 'success' && (
              <>
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-6 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="font-medium text-green-600 dark:text-green-400">{verificationMessage}</p>
              </>
            )}
            
            {verificationStatus === 'error' && (
              <>
                <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-6 mb-4">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-red-600 dark:text-red-400">{verificationMessage}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please make sure you&apos;re at your registered address before trying again.
                </p>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant={verificationStatus === 'success' ? "default" : "outline"}
              onClick={() => setVerificationDialogOpen(false)}
            >
              {verificationStatus === 'success' ? "Done" : "Close"}
            </Button>
            
            {verificationStatus === 'error' && (
              <Button
                variant="default"
                onClick={handleStartVerification}
                disabled={isVerifying}
              >
                Try Again
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
