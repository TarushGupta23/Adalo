import { useQuery } from "@tanstack/react-query";
import { Order, OrderItem, Gemstone } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Package, Clock, Check, AlertTriangle, X, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Extended order item with gemstone data
interface OrderItemWithGemstone extends OrderItem {
  gemstone: Gemstone;
}

// Extended order with items
interface OrderWithItems extends Order {
  items: OrderItemWithGemstone[];
}

export default function OrdersPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
  // Fetch orders
  const { 
    data: orders, 
    isLoading,
    isError,
    error
  } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const response = await fetch(BACKEND_URL+'/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return await response.json();
    },
    enabled: !!user // Only fetch if user is logged in
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Format price
  const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericPrice);
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          <Package className="w-3 h-3 mr-1" /> Processing
        </Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
          <ShoppingBag className="w-3 h-3 mr-1" /> Shipped
        </Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <Check className="w-3 h-3 mr-1" /> Delivered
        </Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          <X className="w-3 h-3 mr-1" /> Cancelled
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          {status}
        </Badge>;
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Package className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
        <h1 className="font-serif text-2xl font-bold mb-4">Please Log In to View Your Orders</h1>
        <p className="text-neutral-600 mb-6">You need to be logged in to view your order history.</p>
        <Button asChild>
          <Link to="/auth">Log In / Sign Up</Link>
        </Button>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="font-serif text-3xl font-bold mb-8 text-primary">Your Orders</h1>
        <div className="animate-pulse">
          <div className="h-24 bg-neutral-200 mb-4 rounded"></div>
          <div className="h-24 bg-neutral-200 mb-4 rounded"></div>
          <div className="h-24 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="font-serif text-3xl font-bold mb-8 text-primary">Your Orders</h1>
        <div className="bg-destructive/10 p-4 rounded-md text-destructive mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <p>Error loading orders: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
        <Button asChild>
          <Link to="/gemstone-marketplace">Browse Marketplace</Link>
        </Button>
      </div>
    );
  }
  
  // Empty orders state
  if (!orders?.length) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Package className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
        <h1 className="font-serif text-2xl font-bold mb-4">No Orders Found</h1>
        <p className="text-neutral-600 mb-6">You haven't placed any orders yet. Browse our gemstone marketplace to find beautiful gemstones for your jewelry designs.</p>
        <Button asChild>
          <Link to="/gemstone-marketplace">Shop Now</Link>
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
      
      <h1 className="font-serif text-3xl font-bold mb-8 text-primary">Your Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="border-b bg-neutral-50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <p className="text-sm text-neutral-500">
                    Placed on {formatDate(order.createdAt.toString())}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="font-bold text-lg">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="items" className="border-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-neutral-50">
                    <span>Order Details</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Image</TableHead>
                            <TableHead>Gemstone</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item) => {
                            const gemstone = item.gemstone;
                            const itemTotal = parseFloat(item.price.toString()) * item.quantity;
                            
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
                                <TableCell>{formatPrice(item.price)}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell className="text-right font-medium">{formatPrice(itemTotal)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-2 text-neutral-800">Shipping Address</h3>
                          <address className="not-italic text-neutral-600">
                            <p>{order.shippingAddress}</p>
                            <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                            <p>{order.shippingCountry}</p>
                          </address>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2 text-neutral-800">Payment Information</h3>
                          <p className="text-neutral-600">
                            Payment Method: {order.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}