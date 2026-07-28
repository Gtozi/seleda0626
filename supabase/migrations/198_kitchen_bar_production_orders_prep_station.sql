-- Migration 198: Add prep_station_id to kitchen/bar production orders
-- Phase 2 Item 4: Link production orders to KDS prep stations
-- This enables routing production orders to the correct KDS display station.

-- Kitchen production orders
ALTER TABLE public.kitchen_production_orders
  ADD COLUMN IF NOT EXISTS prep_station_id UUID;

ALTER TABLE public.kitchen_production_orders
  DROP CONSTRAINT IF EXISTS fk_kitchen_production_orders_prep_station;

ALTER TABLE public.kitchen_production_orders
  ADD CONSTRAINT fk_kitchen_production_orders_prep_station
    FOREIGN KEY (prep_station_id) REFERENCES public.pos_prep_stations(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kitchen_production_orders_prep_station_id
  ON public.kitchen_production_orders(prep_station_id);

-- Bar production orders
ALTER TABLE public.bar_production_orders
  ADD COLUMN IF NOT EXISTS prep_station_id UUID;

ALTER TABLE public.bar_production_orders
  DROP CONSTRAINT IF EXISTS fk_bar_production_orders_prep_station;

ALTER TABLE public.bar_production_orders
  ADD CONSTRAINT fk_bar_production_orders_prep_station
    FOREIGN KEY (prep_station_id) REFERENCES public.pos_prep_stations(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bar_production_orders_prep_station_id
  ON public.bar_production_orders(prep_station_id);
