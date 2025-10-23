import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Edit, Save, X, Eye, EyeOff, Upload, Image } from 'lucide-react';

interface HeroSection {
  id: string;
  section_type: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  background_image_url: string | null;
  background_video_url: string | null;
  cta_primary_text: string | null;
  cta_primary_url: string | null;
  cta_secondary_text: string | null;
  cta_secondary_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const HeroSectionManager: React.FC = () => {
  const { user } = useAuth();
  const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<HeroSection | null>(null);
  
  // Form state - simplified
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [ctaPrimaryText, setCtaPrimaryText] = useState('');
  const [ctaPrimaryUrl, setCtaPrimaryUrl] = useState('');
  const [ctaSecondaryText, setCtaSecondaryText] = useState('');
  const [ctaSecondaryUrl, setCtaSecondaryUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadHeroSections();
  }, []);

  const loadHeroSections = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_section')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setHeroSections(data as HeroSection[]);
    } catch (error) {
      console.error('Error loading hero sections:', error);
      toast.error('Failed to load hero sections');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setDescription('');
    setCtaPrimaryText('');
    setCtaPrimaryUrl('');
    setCtaSecondaryText('');
    setCtaSecondaryUrl('');
    setIsActive(true);
    setEditingSection(null);
  };

  const openEditDialog = (section: HeroSection) => {
    setEditingSection(section);
    setTitle(section.title || '');
    setSubtitle(section.subtitle || '');
    setDescription(section.description || '');
    setCtaPrimaryText(section.cta_primary_text || '');
    setCtaPrimaryUrl(section.cta_primary_url || '');
    setCtaSecondaryText(section.cta_secondary_text || '');
    setCtaSecondaryUrl(section.cta_secondary_url || '');
    setIsActive(section.is_active);
  };

  const handleSaveHeroSection = async () => {
    if (!editingSection) return;

    try {
      const { error } = await supabase
        .from('hero_section')
        .update({
          title: title || null,
          subtitle: subtitle || null,
          description: description || null,
          cta_primary_text: ctaPrimaryText || null,
          cta_primary_url: ctaPrimaryUrl || null,
          cta_secondary_text: ctaSecondaryText || null,
          cta_secondary_url: ctaSecondaryUrl || null,
          is_active: isActive,
        })
        .eq('id', editingSection.id);

      if (error) throw error;

      toast.success('Hero section updated successfully');
      setEditingSection(null);
      resetForm();
      loadHeroSections();
    } catch (error) {
      console.error('Error updating hero section:', error);
      toast.error('Failed to update hero section');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_section')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Hero section ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadHeroSections();
    } catch (error) {
      console.error('Error toggling hero section status:', error);
      toast.error('Failed to update hero section status');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hero Section Content</h2>
          <p className="text-muted-foreground">
            Manage the main hero section content, headlines, and call-to-action buttons
          </p>
        </div>
      </div>

      {/* Hero Sections List */}
      <div className="grid gap-4">
        {heroSections.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No hero sections found.</p>
            </CardContent>
          </Card>
        ) : (
          heroSections.map((section) => (
            <Card key={section.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">#{section.display_order}</Badge>
                      <Badge variant={section.is_active ? "default" : "secondary"}>
                        {section.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{section.section_type}</Badge>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {section.title || 'Untitled Hero Section'}
                      </h3>
                      
                      {section.subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {section.subtitle}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        {/* {section.cta_primary_text && (
                          <span>Primary CTA: {section.cta_primary_text}</span>
                        )}
                        {section.cta_secondary_text && (
                          <span>Secondary CTA: {section.cta_secondary_text}</span>
                        )} */}
                        {section.background_image_url && (
                          <span className="flex items-center">
                            <Image className="h-3 w-3 mr-1" />
                            Has Background Image
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(section.id, section.is_active)}
                    >
                      {section.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(section)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {editingSection && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Hero Section</CardTitle>
            <CardDescription>
              Update the content for: {editingSection.section_type}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Main Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Relieve Pain. Recover Faster. Rise Stronger."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Textarea
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g., Scientifically designed pain relief and recovery solutions..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Professional-grade solutions for peak performance"
                  />
                </div>

              </div>

            </div>
              <div className="space-y-4">
                {/* <div className="space-y-2">
                  <Label>Primary CTA Text</Label>
                  <Input
                    value={ctaPrimaryText}
                    onChange={(e) => setCtaPrimaryText(e.target.value)}
                    placeholder="e.g., Shop Now"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Primary CTA URL</Label>
                  <Input
                    value={ctaPrimaryUrl}
                    onChange={(e) => setCtaPrimaryUrl(e.target.value)}
                    placeholder="e.g., /shop"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Secondary CTA Text</Label>
                  <Input
                    value={ctaSecondaryText}
                    onChange={(e) => setCtaSecondaryText(e.target.value)}
                    placeholder="e.g., Explore Regimens"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Secondary CTA URL</Label>
                  <Input
                    value={ctaSecondaryUrl}
                    onChange={(e) => setCtaSecondaryUrl(e.target.value)}
                    placeholder="e.g., /regimens"
                  />
                </div> */}


                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="is-active">Active</Label>
                </div>
              </div>

            <div className="flex justify-start space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditingSection(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveHeroSection}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
