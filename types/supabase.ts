// Hand-authored to match every table/column referenced in app/page.tsx and app/admin/page.tsx.
//
// This is a stand-in for the real thing. Once you have the Supabase CLI set up locally, generate
// the authoritative version straight from your live schema and overwrite this file:
//
//   npx supabase login
//   npx supabase gen types typescript --project-id <your-project-ref> --schema public > types/supabase.ts
//
// (Project ref is the subdomain in your Supabase URL, e.g. pgfzikvonzpkuiorypkv)
//
// Note: Update types are fully expanded (not Partial<Insert> self-references) on purpose —
// a self-referential lookup back into the Database type being defined caused `never` type
// errors on .update() calls in some TypeScript/supabase-js version combinations.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          created_at: string;
          brand: string;
          model: string;
          ref: string;
          category: string;
          price: number;
          condition: string;
          year: string;
          box: boolean;
          papers: boolean;
          description: string;
          status: string;
          images: string[];
          featured: boolean;
          sort_order: number | null;
          serial_number: string | null;
          dial_color: string | null;
          case_material: string | null;
          bracelet_material: string | null;
          case_size: string | null;
          movement: string | null;
          material: string | null;
          gemstone: string | null;
          color: string | null;
          hardware: string | null;
          size: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          brand: string;
          model: string;
          ref: string;
          category: string;
          price: number;
          condition?: string;
          year?: string;
          box?: boolean;
          papers?: boolean;
          description?: string;
          status?: string;
          images?: string[];
          featured?: boolean;
          sort_order?: number | null;
          serial_number?: string | null;
          dial_color?: string | null;
          case_material?: string | null;
          bracelet_material?: string | null;
          case_size?: string | null;
          movement?: string | null;
          material?: string | null;
          gemstone?: string | null;
          color?: string | null;
          hardware?: string | null;
          size?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          brand?: string;
          model?: string;
          ref?: string;
          category?: string;
          price?: number;
          condition?: string;
          year?: string;
          box?: boolean;
          papers?: boolean;
          description?: string;
          status?: string;
          images?: string[];
          featured?: boolean;
          sort_order?: number | null;
          serial_number?: string | null;
          dial_color?: string | null;
          case_material?: string | null;
          bracelet_material?: string | null;
          case_size?: string | null;
          movement?: string | null;
          material?: string | null;
          gemstone?: string | null;
          color?: string | null;
          hardware?: string | null;
          size?: string | null;
        };
        Relationships: [];
      };

      bookings: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          phone: string;
          email: string;
          date: string;
          time: string;
          interest: string;
          notes: string | null;
          status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          phone: string;
          email: string;
          date: string;
          time: string;
          interest?: string;
          notes?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          phone?: string;
          email?: string;
          date?: string;
          time?: string;
          interest?: string;
          notes?: string | null;
          status?: string;
        };
        Relationships: [];
      };

      orders: {
        Row: {
          id: string;
          created_at: string;
          user_id: string | null;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          items: Json | null;
          total: number | null;
          status: string;
          delivery_method: string | null;
          address: string | null;
          payment_method: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          items?: Json | null;
          total?: number | null;
          status?: string;
          delivery_method?: string | null;
          address?: string | null;
          payment_method?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          items?: Json | null;
          total?: number | null;
          status?: string;
          delivery_method?: string | null;
          address?: string | null;
          payment_method?: string | null;
        };
        Relationships: [];
      };

      hero_banners: {
        Row: {
          id: string;
          image_url: string;
          headline: string;
          subheadline: string;
          tagline: string;
          sort_order: number;
          active: boolean;
        };
        Insert: {
          id?: string;
          image_url: string;
          headline?: string;
          subheadline?: string;
          tagline?: string;
          sort_order?: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          image_url?: string;
          headline?: string;
          subheadline?: string;
          tagline?: string;
          sort_order?: number;
          active?: boolean;
        };
        Relationships: [];
      };

      category_images: {
        Row: {
          id: string;
          image_url: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          image_url: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          image_url?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      exchange_rates: {
        Row: {
          id: number;
          base: string;
          rates: Record<string, number>;
          updated_at: string;
        };
        Insert: {
          id?: number;
          base?: string;
          rates: Record<string, number>;
          updated_at?: string;
        };
        Update: {
          id?: number;
          base?: string;
          rates?: Record<string, number>;
          updated_at?: string;
        };
        Relationships: [];
      };

      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          pin: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          pin: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          pin?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          vip: boolean;
          staff_notes: string | null;
          preferred_contact: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          vip?: boolean;
          staff_notes?: string | null;
          preferred_contact?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          vip?: boolean;
          staff_notes?: string | null;
          preferred_contact?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
