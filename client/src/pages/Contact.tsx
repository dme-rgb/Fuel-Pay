import { Layout } from "@/components/Layout";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Contact() {
    return (
        <Layout showNav={false}>
            <div className="space-y-6 animate-enter">
                <Link href="/">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary -ml-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </Link>

                <div className="space-y-2">
                    <h1 className="text-3xl font-display font-bold text-primary">Contact Us</h1>
                    <p className="text-muted-foreground">We're here to help.</p>
                </div>

                <div className="space-y-4 pt-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
                        <Mail className="w-5 h-5 text-primary mt-1" />
                        <div>
                            <h3 className="font-semibold text-primary">Email Support</h3>
                            <p className="text-sm text-muted-foreground">dme@brcommercials.in</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
                        <Phone className="w-5 h-5 text-primary mt-1" />
                        <div>
                            <h3 className="font-semibold text-primary">Call Us</h3>
                            <p className="text-sm text-muted-foreground">+91 8817828153</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
                        <MapPin className="w-5 h-5 text-primary mt-1" />
                        <div>
                            <h3 className="font-semibold text-primary">Visit Us</h3>
                            <p className="text-sm text-muted-foreground">B R COMMERCIALS RELIANCE JIO-BP PETROL PUMP PLOT NO. 438/1,<br /> SILTARA DHARSIVA BYPASS NH-30, RAIPUR BILASPUR EXPRESS WAY,<br /> DIST, VILAGE, Dharsiwa, Raipur, Chhattisgarh 493221</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
