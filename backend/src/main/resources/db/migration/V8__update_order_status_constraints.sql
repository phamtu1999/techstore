-- Drop old constraints if they exist
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE order_histories DROP CONSTRAINT IF EXISTS order_histories_status_check;

-- Add updated constraints with PROCESSING and REVIEWED
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'REVIEWED'));

ALTER TABLE order_histories ADD CONSTRAINT order_histories_status_check 
    CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'REVIEWED'));
