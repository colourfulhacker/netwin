import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import { KYC_DOCUMENT_TYPES } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { FileUploader } from "../common/FileUploader";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const kycSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  documentNumber: z.string().min(4, "Document number is required"),
  frontImage: z.string().min(1, "Front image is required"),
  backImage: z.string().optional(),
  selfie: z.string().min(1, "Selfie is required"),
});

type KycFormValues = z.infer<typeof kycSchema>;

const KycDocuments = () => {
  const { profile, kycDocuments, getRequiredDocuments, submitKycDocument, getKycStatus } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      documentType: "",
      documentNumber: "",
      frontImage: "",
      backImage: "",
      selfie: ""
    },
  });

  const onSubmit = async (data: KycFormValues) => {
    if (!profile) return;
    
    setLoading(true);
    
    try {
      const success = submitKycDocument({
        type: data.documentType,
        documentNumber: data.documentNumber,
        frontImage: data.frontImage,
        backImage: data.backImage,
        selfie: data.selfie
      });
      
      if (success) {
        toast({
          title: "KYC Submitted",
          description: "Your KYC documents have been submitted for verification.",
        });
        form.reset();
      } else {
        throw new Error("Failed to submit KYC");
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit KYC documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!profile) return null;
  
  const kycStatus = getKycStatus();
  const requiredDocuments = getRequiredDocuments();
  const documentTypes = KYC_DOCUMENT_TYPES[profile.country] || KYC_DOCUMENT_TYPES.default;
  
  // If KYC is already submitted or approved, show status
  if (kycStatus === "approved" || kycStatus === "pending") {
    return (
      <div className="p-6 bg-dark-card rounded-xl border border-gray-800">
        <h3 className="text-lg font-semibold mb-4">KYC Verification</h3>
        
        {kycStatus === "approved" ? (
          <Alert className="bg-green-900 bg-opacity-20 border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-500">Verified</AlertTitle>
            <AlertDescription className="text-green-400">
              Your KYC verification has been approved. You can now withdraw funds.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-yellow-900 bg-opacity-20 border-yellow-800">
            <Clock className="h-4 w-4 text-yellow-500" />
            <AlertTitle className="text-yellow-500">Pending Verification</AlertTitle>
            <AlertDescription className="text-yellow-400">
              Your KYC documents are being reviewed. This process usually takes 24-48 hours.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Show submitted documents */}
        {kycDocuments.length > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="font-medium">Submitted Documents</h4>
            {kycDocuments.map((doc, index) => (
              <div key={index} className="p-3 bg-dark-lighter rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{doc.type}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === "approved" ? "bg-green-600 text-white" :
                    doc.status === "pending" ? "bg-yellow-600 text-white" :
                    "bg-red-600 text-white"
                  }`}>
                    {doc.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Document ID: {doc.documentNumber}</p>
                <p className="text-sm text-gray-400">Submitted on: {new Date(doc.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // If KYC was rejected, show rejection reason and form
  const rejectedDoc = kycDocuments.find(doc => doc.status === "rejected");
  
  return (
    <div className="p-6 bg-dark-card rounded-xl border border-gray-800">
      <h3 className="text-lg font-semibold mb-4">KYC Verification</h3>
      
      {rejectedDoc && (
        <Alert className="bg-red-900 bg-opacity-20 border-red-800 mb-6">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-500">Verification Failed</AlertTitle>
          <AlertDescription className="text-red-400">
            {rejectedDoc.rejectionReason || "Your KYC verification was rejected. Please resubmit with valid documents."}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Required Documents for {profile.country}</h4>
        <ul className="list-disc pl-5 space-y-1 text-gray-400">
          {requiredDocuments.map((doc, index) => (
            <li key={index}>{doc}</li>
          ))}
        </ul>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <SelectTrigger className="bg-dark-lighter border-0 focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-dark-lighter border-gray-700">
                    {documentTypes.map((doc) => (
                      <SelectItem 
                        key={doc.value} 
                        value={doc.value}
                        className="hover:bg-gray-700"
                      >
                        {doc.label}
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
                    {...field} 
                    placeholder="Enter document number"
                    className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </FormControl>
                <FormDescription>
                  Enter the identification number on your document.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="frontImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Front Image</FormLabel>
                <FormControl>
                  <FileUploader 
                    value={field.value}
                    onChange={field.onChange}
                    accept="image/*"
                    maxSize={5}
                  />
                </FormControl>
                <FormDescription>
                  Upload front side of your document. Max 5MB.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="backImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Back Image (Optional)</FormLabel>
                <FormControl>
                  <FileUploader 
                    value={field.value}
                    onChange={field.onChange}
                    accept="image/*"
                    maxSize={5}
                  />
                </FormControl>
                <FormDescription>
                  Upload back side of your document if applicable. Max 5MB.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="selfie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selfie with Document</FormLabel>
                <FormControl>
                  <FileUploader 
                    value={field.value}
                    onChange={field.onChange}
                    accept="image/*"
                    maxSize={5}
                  />
                </FormControl>
                <FormDescription>
                  Upload a selfie of yourself holding the document. Max 5MB.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="mt-6">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit for Verification"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default KycDocuments;
