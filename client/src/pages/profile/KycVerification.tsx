import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  ShieldCheck,
  UploadCloud,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Image,
  Camera,
  Loader2,
} from "lucide-react";
import { getRequiredKycDocuments } from "@/lib/utils";

// Form schema
const kycSchema = z.object({
  documentType: z.string({
    required_error: "Please select document type",
  }),
  documentNumber: z.string().min(5, {
    message: "Document number must be at least 5 characters",
  }),
  frontImage: z.string({
    required_error: "Front image is required",
  }),
  backImage: z.string().optional(),
  selfie: z.string({
    required_error: "Selfie is required",
  }),
});

type KycFormValues = z.infer<typeof kycSchema>;

export default function KycVerification() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { uploadKycDocument, getKycDocuments } = useUser();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>("upload");
  const [uploading, setUploading] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);
  const selfieFileRef = useRef<HTMLInputElement>(null);
  
  // Form
  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      documentType: "",
      documentNumber: "",
      frontImage: "",
      backImage: "",
      selfie: "",
    },
  });
  
  if (!user) return null;
  
  // Get available document types based on user's country
  const availableDocuments = getRequiredKycDocuments(user.country);
  
  // Get user's KYC documents
  const kycDocuments = getKycDocuments();
  const pendingDocument = kycDocuments.find(doc => doc.status === "pending");
  const rejectedDocument = kycDocuments.find(doc => doc.status === "rejected");
  const verifiedDocument = kycDocuments.find(doc => doc.status === "verified");
  
  // Handle form submission
  const onSubmit = async (values: KycFormValues) => {
    setIsSubmitting(true);
    try {
      const success = await uploadKycDocument({
        type: values.documentType,
        documentNumber: values.documentNumber,
        frontImage: values.frontImage,
        backImage: values.backImage || null,
        selfie: values.selfie,
      });
      
      if (success) {
        toast({
          title: "KYC submitted successfully",
          description: "Your documents have been submitted for verification.",
        });
        setSelectedTab("status");
      } else {
        toast({
          variant: "destructive",
          title: "Submission failed",
          description: "Failed to submit KYC documents. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "frontImage" | "backImage" | "selfie") => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please upload an image file.",
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image size should be less than 5MB.",
      });
      return;
    }
    
    setUploading(fieldName);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          form.setValue(fieldName, reader.result);
          toast({
            title: "Image uploaded",
            description: "Document image uploaded successfully.",
          });
        }
        setUploading(null);
      };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "An error occurred. Please try again.",
      });
      setUploading(null);
    }
  };
  
  // Trigger file input click
  const triggerFileUpload = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };
  
  // Go back to profile
  const goBack = () => {
    setLocation("/profile");
  };
  
  // Check if document type requires back image
  const needsBackImage = form.watch("documentType") === "NATIONAL_ID" || 
                         form.watch("documentType") === "DRIVING_LICENSE" ||
                         form.watch("documentType") === "VOTER_ID";
  
  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        className="mb-6 text-gray-400"
        onClick={goBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Profile
      </Button>
      
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins">
          KYC Verification
        </h1>
        <p className="text-gray-400 mt-1">
          Verify your identity to unlock all features
        </p>
      </div>
      
      <Tabs 
        defaultValue="upload" 
        value={selectedTab} 
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upload" disabled={user.kycStatus === "verified" || user.kycStatus === "pending"}>
            Upload Documents
          </TabsTrigger>
          <TabsTrigger value="status">
            Verification Status
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card className="bg-dark-card border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-2">Document Verification</h2>
            <p className="text-gray-400 mb-6">
              Upload your identity documents for verification. This is required for withdrawals and high-stakes tournaments.
            </p>
            
            <Alert className="mb-6 bg-primary/10 border-primary/30">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Secure Verification</AlertTitle>
              <AlertDescription className="text-gray-300">
                Your documents are encrypted and used only for verification purposes. We never share your data with third parties.
              </AlertDescription>
            </Alert>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-dark-lighter border-gray-700">
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-card border-gray-700">
                            {availableDocuments.map((doc) => (
                              <SelectItem key={doc} value={doc}>
                                {doc.replace(/_/g, ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="documentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter document number"
                            className="bg-dark-lighter border-gray-700"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator className="bg-gray-800 my-4" />
                
                <div className="space-y-6">
                  <h3 className="text-md font-medium">Document Images</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="frontImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Front Side</FormLabel>
                          <FormControl>
                            <div>
                              <input
                                type="file"
                                ref={frontFileRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, "frontImage")}
                              />
                              
                              {field.value ? (
                                <div className="relative">
                                  <img
                                    src={field.value}
                                    alt="Front side"
                                    className="w-full h-40 object-cover rounded-lg border border-gray-700"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="absolute bottom-2 right-2 bg-dark-card border-gray-700"
                                    onClick={() => triggerFileUpload(frontFileRef)}
                                  >
                                    <Image className="h-4 w-4 mr-1" />
                                    Change
                                  </Button>
                                </div>
                              ) : (
                                <div
                                  className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors"
                                  onClick={() => triggerFileUpload(frontFileRef)}
                                >
                                  {uploading === "frontImage" ? (
                                    <Loader2 className="h-10 w-10 text-gray-500 animate-spin" />
                                  ) : (
                                    <>
                                      <UploadCloud className="h-10 w-10 text-gray-500 mb-2" />
                                      <p className="text-sm text-gray-400">
                                        Click to upload front side
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        PNG, JPG or JPEG (max 5MB)
                                      </p>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {needsBackImage && (
                      <FormField
                        control={form.control}
                        name="backImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Back Side</FormLabel>
                            <FormControl>
                              <div>
                                <input
                                  type="file"
                                  ref={backFileRef}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, "backImage")}
                                />
                                
                                {field.value ? (
                                  <div className="relative">
                                    <img
                                      src={field.value}
                                      alt="Back side"
                                      className="w-full h-40 object-cover rounded-lg border border-gray-700"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="absolute bottom-2 right-2 bg-dark-card border-gray-700"
                                      onClick={() => triggerFileUpload(backFileRef)}
                                    >
                                      <Image className="h-4 w-4 mr-1" />
                                      Change
                                    </Button>
                                  </div>
                                ) : (
                                  <div
                                    className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors"
                                    onClick={() => triggerFileUpload(backFileRef)}
                                  >
                                    {uploading === "backImage" ? (
                                      <Loader2 className="h-10 w-10 text-gray-500 animate-spin" />
                                    ) : (
                                      <>
                                        <UploadCloud className="h-10 w-10 text-gray-500 mb-2" />
                                        <p className="text-sm text-gray-400">
                                          Click to upload back side
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          PNG, JPG or JPEG (max 5MB)
                                        </p>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="selfie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selfie with Document</FormLabel>
                        <FormControl>
                          <div>
                            <input
                              type="file"
                              ref={selfieFileRef}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, "selfie")}
                            />
                            
                            {field.value ? (
                              <div className="relative">
                                <img
                                  src={field.value}
                                  alt="Selfie with document"
                                  className="w-full h-60 object-cover rounded-lg border border-gray-700"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="absolute bottom-2 right-2 bg-dark-card border-gray-700"
                                  onClick={() => triggerFileUpload(selfieFileRef)}
                                >
                                  <Camera className="h-4 w-4 mr-1" />
                                  Change
                                </Button>
                              </div>
                            ) : (
                              <div
                                className="flex flex-col items-center justify-center h-60 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors"
                                onClick={() => triggerFileUpload(selfieFileRef)}
                              >
                                {uploading === "selfie" ? (
                                  <Loader2 className="h-10 w-10 text-gray-500 animate-spin" />
                                ) : (
                                  <>
                                    <Camera className="h-10 w-10 text-gray-500 mb-2" />
                                    <p className="text-sm text-gray-400">
                                      Take a selfie holding your document
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      PNG, JPG or JPEG (max 5MB)
                                    </p>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Alert className="bg-dark-lighter border-gray-700">
                    <HelpCircle className="h-4 w-4" />
                    <AlertTitle>Requirements</AlertTitle>
                    <AlertDescription className="text-gray-300">
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        <li>All document details must be clearly visible</li>
                        <li>Take the selfie with your face and document clearly visible</li>
                        <li>Ensure good lighting when taking photos</li>
                        <li>Documents must be valid and not expired</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-primary to-secondary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit for Verification"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        <TabsContent value="status">
          <Card className="bg-dark-card border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-6">Verification Status</h2>
            
            {user.kycStatus === "verified" && verifiedDocument && (
              <div className="space-y-6">
                <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-medium text-green-500">
                        Verification Complete
                      </h3>
                      <p className="text-gray-300 mt-1">
                        Your identity has been verified successfully. You now have access to all platform features.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium mb-3">Document Information</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                        <div className="text-sm text-gray-400">Document Type</div>
                        <div className="font-medium">
                          {verifiedDocument.type.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                        <div className="text-sm text-gray-400">Document Number</div>
                        <div className="font-medium">
                          {`${verifiedDocument.documentNumber.substring(0, 4)}****${verifiedDocument.documentNumber.substring(verifiedDocument.documentNumber.length - 4)}`}
                        </div>
                      </div>
                      <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                        <div className="text-sm text-gray-400">Verified On</div>
                        <div className="font-medium">
                          {new Date(verifiedDocument.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium mb-3">Unlocked Features</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-dark-lighter rounded-lg flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        <div className="font-medium">Unlimited Withdrawals</div>
                      </div>
                      <div className="p-3 bg-dark-lighter rounded-lg flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        <div className="font-medium">High-Stakes Tournaments</div>
                      </div>
                      <div className="p-3 bg-dark-lighter rounded-lg flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        <div className="font-medium">Priority Customer Support</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {user.kycStatus === "pending" && pendingDocument && (
              <div className="space-y-6">
                <div className="p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                  <div className="flex items-start">
                    <Clock className="h-6 w-6 text-yellow-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-medium text-yellow-500">
                        Verification in Progress
                      </h3>
                      <p className="text-gray-300 mt-1">
                        Your documents are being reviewed. This process usually takes 24-48 hours. We'll notify you once verification is complete.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Document Information</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                      <div className="text-sm text-gray-400">Document Type</div>
                      <div className="font-medium">
                        {pendingDocument.type.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                      <div className="text-sm text-gray-400">Document Number</div>
                      <div className="font-medium">
                        {`${pendingDocument.documentNumber.substring(0, 4)}****${pendingDocument.documentNumber.substring(pendingDocument.documentNumber.length - 4)}`}
                      </div>
                    </div>
                    <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                      <div className="text-sm text-gray-400">Submitted On</div>
                      <div className="font-medium">
                        {new Date(pendingDocument.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                      <div className="text-sm text-gray-400">Status</div>
                      <Badge className="bg-yellow-500/20 text-yellow-500 gap-1">
                        <Clock className="h-3 w-3" />
                        Pending Review
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Alert className="bg-dark-lighter border-gray-700">
                  <HelpCircle className="h-4 w-4" />
                  <AlertTitle>What happens next?</AlertTitle>
                  <AlertDescription className="text-gray-300">
                    <p className="mb-2">Our team will review your documents and verify your identity.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>You'll receive a notification once verification is complete</li>
                      <li>If there are any issues, we'll contact you for additional information</li>
                      <li>You can check this page for status updates</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {user.kycStatus === "rejected" && rejectedDocument && (
              <div className="space-y-6">
                <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
                  <div className="flex items-start">
                    <XCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-medium text-red-500">
                        Verification Failed
                      </h3>
                      <p className="text-gray-300 mt-1">
                        Your document verification was unsuccessful. Please review the reason below and submit again.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Document Information</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                      <div className="text-sm text-gray-400">Document Type</div>
                      <div className="font-medium">
                        {rejectedDocument.type.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                      <div className="text-sm text-gray-400">Document Number</div>
                      <div className="font-medium">
                        {`${rejectedDocument.documentNumber.substring(0, 4)}****${rejectedDocument.documentNumber.substring(rejectedDocument.documentNumber.length - 4)}`}
                      </div>
                    </div>
                    <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                      <div className="text-sm text-gray-400">Submitted On</div>
                      <div className="font-medium">
                        {new Date(rejectedDocument.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                      <div className="text-sm text-gray-400">Status</div>
                      <Badge className="bg-red-500/20 text-red-500 gap-1">
                        <XCircle className="h-3 w-3" />
                        Rejected
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-dark-lighter border-l-4 border-red-500 rounded-lg">
                  <h3 className="text-md font-medium mb-2">Rejection Reason</h3>
                  <p className="text-gray-300">
                    {rejectedDocument.rejectionReason || "Document was unclear or information could not be verified. Please ensure all details are clearly visible and try again."}
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    className="bg-gradient-to-r from-primary to-secondary"
                    onClick={() => setSelectedTab("upload")}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
            
            {user.kycStatus !== "verified" && user.kycStatus !== "pending" && user.kycStatus !== "rejected" && (
              <div className="space-y-6">
                <div className="p-4 bg-dark-lighter border border-gray-700 rounded-lg text-center">
                  <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">
                    Not Verified
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-4">
                    You haven't submitted your documents for verification yet. Complete KYC to unlock all platform features.
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-primary to-secondary"
                    onClick={() => setSelectedTab("upload")}
                  >
                    Start Verification
                  </Button>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Benefits of KYC Verification</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-dark-lighter rounded-lg flex items-center">
                      <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-full mr-3">
                        <Wallet className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Unlimited Withdrawals</div>
                        <div className="text-xs text-gray-400">
                          Withdraw your winnings without limitations
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-dark-lighter rounded-lg flex items-center">
                      <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-full mr-3">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">High-Stakes Tournaments</div>
                        <div className="text-xs text-gray-400">
                          Participate in tournaments with bigger prize pools
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-dark-lighter rounded-lg flex items-center">
                      <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-full mr-3">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Account Security</div>
                        <div className="text-xs text-gray-400">
                          Added protection for your account and funds
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}