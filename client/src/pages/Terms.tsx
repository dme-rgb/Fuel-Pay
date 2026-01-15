import { Layout } from "@/components/Layout";
import { ArrowLeft, FileText, Shield } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Terms() {
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
                    <h1 className="text-3xl font-display font-bold text-primary">Legal Info</h1>
                    <p className="text-muted-foreground">Review our terms and policies.</p>
                </div>

                <Tabs defaultValue="terms" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
                        <TabsTrigger value="policies">Policies</TabsTrigger>
                    </TabsList>

                    <TabsContent value="terms" className="space-y-4 animate-enter">
                        <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                            <div>
                                <h3 className="font-semibold text-primary flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4" /> Terms & Conditions
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Welcome to BR Commercials, operating a Jio BP Fuel Station. By using this website and making a payment through our platform, you agree to the following Terms & Conditions.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">1. Service Description</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    This platform allows customers to make digital payments for fuel and related services at our Jio BP Fuel Station. Customers are required to enter their contact number, vehicle number, and payment amount before proceeding with payment.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">2. User Responsibility</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Customers are responsible for entering correct and accurate details</li>
                                    <li>Please verify the vehicle number and amount before completing payment</li>
                                    <li>BR Commercials is not responsible for payments made with incorrect details entered by the customer</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">3. Payments</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Payments are processed through a secure third-party payment gateway</li>
                                    <li>A transaction is considered successful only after confirmation from the payment gateway</li>
                                    <li>We do not store or process any card, UPI, or banking details</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">4. Failed Transactions</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    If a transaction fails but the amount is debited from your account, resolution will be handled as per your bank or payment gateway policies. BR Commercials is not responsible for delays caused by third-party services.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">5. No Refund Policy</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    All payments made through this platform are final and non-refundable. Customers are advised to carefully verify all details before making payment.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">6. Limitation of Liability</h4>
                                <p className="text-sm text-muted-foreground mb-1">BR Commercials shall not be liable for:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Incorrect payments due to user-entered information</li>
                                    <li>Payment gateway or network failures</li>
                                    <li>Any indirect or consequential losses</li>
                                </ul>
                                <p className="text-sm text-muted-foreground mt-1">Our maximum liability shall not exceed the amount paid for the transaction.</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">7. Governing Law</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    These Terms & Conditions shall be governed by the laws of India.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="policies" className="space-y-4 animate-enter">
                        <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                            <div>
                                <h3 className="font-semibold text-primary flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4" /> Privacy Policy
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    This Privacy Policy explains how BR Commercials, operating a Jio BP Fuel Station, collects and uses customer information through this website.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">1. Information We Collect</h4>
                                <p className="text-sm text-muted-foreground mb-1">We may collect the following information:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Contact number</li>
                                    <li>Vehicle number</li>
                                    <li>Payment amount</li>
                                    <li>Transaction ID and payment status</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">2. Purpose of Data Collection</h4>
                                <p className="text-sm text-muted-foreground mb-1">The collected information is used for:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Processing fuel payments</li>
                                    <li>Transaction identification and record-keeping</li>
                                    <li>Customer support and dispute resolution</li>
                                    <li>Legal and accounting requirements</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">3. Payment Information Security</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>We do not store or process any debit card, credit card, UPI, or banking details.</li>
                                    <li>All payments are securely processed through authorized third-party payment gateways. We only receive transaction confirmation details.</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">4. Data Storage</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Customer and transaction data may be stored securely in internal systems, including tools such as Google Sheets, strictly for operational and record-keeping purposes.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">5. Data Sharing</h4>
                                <p className="text-sm text-muted-foreground mb-1">We do not sell or share customer data with third parties, except:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Payment gateway providers for transaction processing</li>
                                    <li>Legal authorities when required by law</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">6. Data Security</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    We take reasonable measures to protect customer data. However, no online system is completely secure, and absolute security cannot be guaranteed.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">7. Cookies</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    This website may use cookies to improve functionality and user experience. Users may control cookies through browser settings.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-primary">8. Policy Updates</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    This Privacy Policy may be updated from time to time. Any changes will be posted on this page.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                            <h3 className="font-semibold text-primary flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4" /> Refund Policy
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                No refund policy.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}
