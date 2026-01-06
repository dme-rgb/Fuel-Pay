import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Payment from "@/pages/Payment";
import Success from "@/pages/Success";
import AdminDashboard from "@/pages/AdminDashboard";
import Login from "@/pages/Login";
import CustomerLogin from "@/pages/CustomerLogin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Home} />
      <Route path="/customer-login" component={CustomerLogin} />
      <Route path="/payment" component={Payment} />
      <Route path="/success" component={Success} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/auth" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
