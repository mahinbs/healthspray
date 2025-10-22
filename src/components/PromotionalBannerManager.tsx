import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PromotionalBanner {
  id: string;
  text: string;
  text_color: string;
  background_color: string;
  is_active: boolean;
  animation_speed: number;
  created_at: string;
  updated_at: string;
}

const PromotionalBannerManager = () => {
  const [banner, setBanner] = useState<PromotionalBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#FF6B35');
  const [isActive, setIsActive] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(50);

  useEffect(() => {
    loadBanner();
  }, []);

  const loadBanner = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promotional_banner')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading promotional banner:', error);
        toast.error('Failed to load promotional banner');
        return;
      }

      if (data) {
        setBanner(data);
        setText(data.text);
        setTextColor(data.text_color);
        setBackgroundColor(data.background_color);
        setIsActive(data.is_active);
        setAnimationSpeed(data.animation_speed);
      }
    } catch (error) {
      console.error('Error loading promotional banner:', error);
      toast.error('Failed to load promotional banner');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!text.trim()) {
      toast.error('Please enter banner text');
      return;
    }

    try {
      setSaving(true);

      if (banner) {
        // Update existing banner
        const { error } = await supabase
          .from('promotional_banner')
          .update({
            text: text.trim(),
            text_color: textColor,
            background_color: backgroundColor,
            is_active: isActive,
            animation_speed: animationSpeed,
            updated_at: new Date().toISOString(),
          })
          .eq('id', banner.id);

        if (error) throw error;
        toast.success('Promotional banner updated successfully');
      } else {
        // Create new banner
        const { error } = await supabase
          .from('promotional_banner')
          .insert({
            text: text.trim(),
            text_color: textColor,
            background_color: backgroundColor,
            is_active: isActive,
            animation_speed: animationSpeed,
          });

        if (error) throw error;
        toast.success('Promotional banner created successfully');
      }

      setEditing(false);
      await loadBanner();
    } catch (error) {
      console.error('Error saving promotional banner:', error);
      toast.error('Failed to save promotional banner');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (banner) {
      setText(banner.text);
      setTextColor(banner.text_color);
      setBackgroundColor(banner.background_color);
      setIsActive(banner.is_active);
      setAnimationSpeed(banner.animation_speed);
    } else {
      setText('');
      setTextColor('#FFFFFF');
      setBackgroundColor('#FF6B35');
      setIsActive(true);
      setAnimationSpeed(50);
    }
    setEditing(false);
  };

  const handleToggleActive = async () => {
    if (!banner) return;

    try {
      const newActiveState = !isActive;
      const { error } = await supabase
        .from('promotional_banner')
        .update({
          is_active: newActiveState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', banner.id);

      if (error) throw error;

      setIsActive(newActiveState);
      toast.success(`Banner ${newActiveState ? 'activated' : 'deactivated'} successfully`);
      await loadBanner();
    } catch (error) {
      console.error('Error toggling banner status:', error);
      toast.error('Failed to update banner status');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Promotional Banner</CardTitle>
          <CardDescription>Manage the promotional banner displayed on all pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Promotional Banner</CardTitle>
            <CardDescription>Manage the promotional banner displayed on all pages</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {banner && (
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Banner Text</Label>
              <Input
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter promotional message..."
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#FF6B35"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="animationSpeed">Animation Speed (seconds)</Label>
              <Input
                id="animationSpeed"
                type="number"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value) || 50)}
                min="10"
                max="200"
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground">
                Lower values = faster scrolling, Higher values = slower scrolling
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            {/* Preview */}
            {text && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div 
                  className="relative overflow-hidden py-2 px-4 text-center font-medium text-sm rounded"
                  style={{
                    backgroundColor: backgroundColor,
                    color: textColor,
                  }}
                >
                  <div 
                    className="whitespace-nowrap animate-scroll"
                    style={{
                      animationDuration: `${animationSpeed}s`,
                      animationTimingFunction: 'linear',
                      animationIterationCount: 'infinite',
                    }}
                  >
                    {text}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {banner ? (
              <>
                <div className="space-y-2">
                  <Label>Current Banner Text</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{banner.text}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Text Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: banner.text_color }}
                      />
                      <span className="text-sm text-muted-foreground">{banner.text_color}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: banner.background_color }}
                      />
                      <span className="text-sm text-muted-foreground">{banner.background_color}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Animation Speed</Label>
                  <p className="text-sm text-muted-foreground mt-1">{banner.animation_speed} seconds</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="toggleActive"
                      checked={isActive}
                      onCheckedChange={handleToggleActive}
                    />
                    <Label htmlFor="toggleActive">
                      {isActive ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No promotional banner found</p>
                <Button onClick={() => setEditing(true)}>
                  Create Promotional Banner
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromotionalBannerManager;
