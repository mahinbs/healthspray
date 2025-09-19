import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const bulkAddUpurfitProducts = async () => {
  try {
    console.log("Calling bulk-add-products function...");
    
    const { data, error } = await supabase.functions.invoke('bulk-add-products');
    
    if (error) {
      console.error('Error calling bulk-add-products:', error);
      toast.error('Failed to add products. Please try again.');
      return false;
    }
    
    if (data.success) {
      toast.success(`Successfully added ${data.inserted} Upurfit products!`);
      if (data.skipped > 0) {
        toast.info(`${data.skipped} products were already in the database.`);
      }
      console.log('Bulk add result:', data);
      return true;
    } else {
      toast.error(data.error || 'Failed to add products');
      return false;
    }
  } catch (error) {
    console.error('Error in bulk add products:', error);
    toast.error('Failed to add products. Please try again.');
    return false;
  }
};