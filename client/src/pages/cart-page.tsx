import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Cart, CartItem, Gemstone } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

// Extended cart item with gemstone data
interface CartItemWithGemstone extends CartItem {
  gemstone: Gemstone;
}

// Cart data with items
interface CartWithItems extends Cart {
  items: CartItemWithGemstone[];
}

export default function CartPage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  // Form state for checkout
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [shippingCountry, setShippingCountry] = useState("USA");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  // Fetch cart data
  // Add BACKEND_URL constant
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000"; // Changed: Added BACKEND_URL from process.env

  const {
    data: cart,
    isLoading,
    isError,
    error,
  } = useQuery<CartWithItems>({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/api/cart`); // Changed: Prepended BACKEND_URL to the request URL
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      return await response.json();
    },
    enabled: !!user // Only fetch if user is logged in
  });

  // Update cart item quantity
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number, quantity: number }) => {
      await apiRequest('PATCH', `/api/cart/items/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart Updated",
        description: "Item quantity has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update item",
        variant: "destructive",
      });
    }
  });

  // Remove item from cart
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest('DELETE', `/api/cart/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove item",
        variant: "destructive",
      });
    }
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async (checkoutData: {
      shippingAddress: string;
      shippingCity: string;
      shippingState: string;
      shippingZip: string;
      shippingCountry: string;
      paymentMethod: string;
    }) => {
      return await apiRequest('POST', '/api/checkout', checkoutData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Order Placed Successfully",
        description: "Your order has been placed and is being processed.",
      });
      setLocation('/orders');
    },
    onError: (error) => {
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Failed to place your order",
        variant: "destructive",
      });
    }
  });

  // Handle quantity update
  const handleUpdateQuantity = (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    updateItemMutation.mutate({ itemId, quantity: newQuantity });
  };

  // Handle item removal
  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate(itemId);
  };

  // Handle checkout
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress || !shippingCity || !shippingState || !shippingZip || !shippingCountry || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required shipping and payment information.",
        variant: "destructive",
      });
      return;
    }

    checkoutMutation.mutate({
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry,
      paymentMethod,
    });
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    if (!cart?.items?.length) return 0;

    return cart.items.reduce((total, item) => {
      const price = parseFloat(item.gemstone.price.toString());
      return total + (price * item.quantity);
    }, 0);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
        <h1 className="font-serif text-2xl font-bold mb-4">Please Log In to View Your Cart</h1>
        <p className="text-neutral-600 mb-6">You need to be logged in to view your shopping cart and make purchases.</p>
        <Button asChild>
          <Link to="/auth">Log In / Sign Up</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="font-serif text-3xl font-bold mb-8 text-primary">Your Shopping Cart</h1>
        <div className="animate-pulse">
          <div className="h-12 bg-neutral-200 mb-4 rounded"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="font-serif text-3xl font-bold mb-8 text-primary">Your Shopping Cart</h1>
        <div className="bg-destructive/10 p-4 rounded-md text-destructive mb-4">
          <p>Error loading cart: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
        <Button asChild>
          <Link to="/gemstone-marketplace">Return to Marketplace</Link>
        </Button>
      </div>
    );
  }

  // Empty cart state
  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
        <h1 className="font-serif text-2xl font-bold mb-4">Your Shopping Cart is Empty</h1>
        <p className="text-neutral-600 mb-6">Browse our gemstone marketplace to find beautiful gemstones for your jewelry designs.</p>
        <Button asChild>
          <Link to="/gemstone-marketplace">Browse Gemstones</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/gemstone-marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </Button>
      </div>

      <h1 className="font-serif text-3xl font-bold mb-8 text-primary">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items ({cart.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Gemstone</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => {
                    const gemstone = item.gemstone;
                    const itemPrice = parseFloat(gemstone.price.toString());
                    const itemTotal = itemPrice * item.quantity;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <img
                            src={gemstone.imageUrl}
                            alt={gemstone.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{gemstone.name}</div>
                          <div className="text-sm text-neutral-500">{gemstone.caratWeight} carats, {gemstone.color}</div>
                        </TableCell>
                        <TableCell>{formatPrice(itemPrice)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                              disabled={item.quantity <= 1 || updateItemMutation.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="mx-2 w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              disabled={updateItemMutation.isPending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatPrice(itemTotal)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeItemMutation.isPending}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary and Checkout */}
        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>{formatPrice(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t mt-4">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(calculateSubtotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping & Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Shipping Address</Label>
                  <Input
                    id="address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP/Postal Code</Label>
                    <Input
                      id="zip"
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={shippingCountry}
                      onValueChange={setShippingCountry}
                    >
                      <SelectTrigger id="country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USA">United States</SelectItem>
                        <SelectItem value="CAN">Canada</SelectItem>
                        <SelectItem value="GBR">United Kingdom</SelectItem>
                        <SelectItem value="AUS">Australia</SelectItem>
                        <SelectItem value="JPN">Japan</SelectItem>
                        <SelectItem value="DEU">Germany</SelectItem>
                        <SelectItem value="FRA">France</SelectItem>
                        <SelectItem value="ITA">Italy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment">Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger id="payment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Complete Purchase
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-sm text-neutral-500">
              <p>
                All gemstones are provided by GemsBiz (<a href="http://www.gemsbiz.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.gemsbiz.com</a>),
                a trusted supplier in the jewelry industry.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}