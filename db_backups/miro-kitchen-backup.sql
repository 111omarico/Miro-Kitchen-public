--
-- PostgreSQL database dump
--

\restrict fXO2u6KNF35ONq0TRRI5wmpNApJzf2MpUlGglhjfDTS1kLvd1qwwZiIFvjv6APv

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auto_promote_first_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.auto_promote_first_user() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF NEW.user_id = '000000000001' THEN
          NEW.is_admin := TRUE;
        END IF;
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.auto_promote_first_user() OWNER TO postgres;

--
-- Name: generate_delivery_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_delivery_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF NEW.delivery_id IS NULL OR trim(NEW.delivery_id) = '' THEN
          NEW.delivery_id := lpad(nextval('delivery_id_seq')::text, 12, '0');
        END IF;
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.generate_delivery_id() OWNER TO postgres;

--
-- Name: generate_item_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_item_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF NEW.item_id IS NULL OR trim(NEW.item_id) = '' THEN
          NEW.item_id := lpad(nextval('item_id_seq')::text, 12, '0');
        END IF;
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.generate_item_id() OWNER TO postgres;

--
-- Name: generate_order_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_order_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF NEW.order_id IS NULL OR trim(NEW.order_id) = '' THEN
          NEW.order_id := lpad(nextval('order_id_seq')::text, 12, '0');
        END IF;
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.generate_order_id() OWNER TO postgres;

--
-- Name: generate_review_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_review_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF NEW.review_id IS NULL OR trim(NEW.review_id) = '' THEN
          NEW.review_id := lpad(nextval('review_id_seq')::text, 12, '0');
        END IF;
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.generate_review_id() OWNER TO postgres;

--
-- Name: generate_user_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_user_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF NEW.user_id IS NULL OR trim(NEW.user_id) = '' THEN
          NEW.user_id := lpad(nextval('user_id_seq')::text, 12, '0');
        END IF;
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.generate_user_id() OWNER TO postgres;

--
-- Name: notify_item_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_item_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      DECLARE payload JSON;
      BEGIN
        IF TG_OP = 'DELETE' THEN
          payload := json_build_object('op', TG_OP, 'row', row_to_json(OLD));
          PERFORM pg_notify('item_updates', payload::text);
          RETURN OLD;
        ELSE
          payload := json_build_object('op', TG_OP, 'row', row_to_json(NEW));
          PERFORM pg_notify('item_updates', payload::text);
          RETURN NEW;
        END IF;
      END;
      $$;


ALTER FUNCTION public.notify_item_change() OWNER TO postgres;

--
-- Name: delivery_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.delivery_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    MAXVALUE 999999999999
    CACHE 1;


ALTER SEQUENCE public.delivery_id_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: delivery_information; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_information (
    delivery_id character varying(12) NOT NULL,
    order_id character varying(12) NOT NULL,
    delivery_address text NOT NULL,
    eta_initial_seconds integer,
    eta_travel_seconds integer,
    eta_prep_seconds integer,
    eta_total_seconds integer,
    eta_distance_meters integer,
    eta_last_updated timestamp without time zone DEFAULT now(),
    delivery_state text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT delivery_information_delivery_state_check CHECK ((delivery_state = ANY (ARRAY['pending'::text, 'preparing'::text, 'out_for_delivery'::text, 'completed'::text])))
);


ALTER TABLE public.delivery_information OWNER TO postgres;

--
-- Name: item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    MAXVALUE 999999999999
    CACHE 1;


ALTER SEQUENCE public.item_id_seq OWNER TO postgres;

--
-- Name: item_information; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_information (
    item_id character varying(12) NOT NULL,
    item_price numeric(7,2) NOT NULL,
    item_name text NOT NULL,
    discount numeric(4,2) NOT NULL,
    restriction integer NOT NULL,
    item_description text NOT NULL,
    allergen_description text NOT NULL,
    image text,
    category text NOT NULL,
    CONSTRAINT item_information_allergen_description_check CHECK ((char_length(allergen_description) >= 12)),
    CONSTRAINT item_information_discount_check CHECK (((discount >= (0)::numeric) AND (discount <= (1)::numeric))),
    CONSTRAINT item_information_item_description_check CHECK ((char_length(item_description) >= 0)),
    CONSTRAINT item_information_item_price_check CHECK (((item_price > (0)::numeric) AND (item_price <= 99999.99))),
    CONSTRAINT item_information_restriction_check CHECK (((restriction >= 0) AND (restriction <= 99999)))
);


ALTER TABLE public.item_information OWNER TO postgres;

--
-- Name: order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    MAXVALUE 999999999999
    CACHE 1;


ALTER SEQUENCE public.order_id_seq OWNER TO postgres;

--
-- Name: purchase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase (
    order_id character varying(12) NOT NULL,
    item_id character varying(12) NOT NULL,
    user_id character varying(12) NOT NULL,
    quantity integer NOT NULL,
    total_transaction numeric(7,2) NOT NULL,
    order_state text DEFAULT 'pending'::text NOT NULL,
    timer_starttimestamp timestamp without time zone,
    timer_endtimestamp timestamp without time zone,
    order_timestamp timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT purchase_order_state_check CHECK ((order_state = ANY (ARRAY['pending'::text, 'accepted'::text, 'paid'::text, 'preparing'::text, 'out_for_delivery'::text, 'completed'::text, 'rejected'::text]))),
    CONSTRAINT purchase_quantity_check CHECK (((quantity >= 1) AND (quantity <= 99999))),
    CONSTRAINT purchase_total_transaction_check CHECK (((total_transaction >= (0)::numeric) AND (total_transaction <= 99999.99)))
);


ALTER TABLE public.purchase OWNER TO postgres;

--
-- Name: review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    MAXVALUE 999999999999
    CACHE 1;


ALTER SEQUENCE public.review_id_seq OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    review_id character varying(12) NOT NULL,
    review_description character varying(372) NOT NULL,
    item_id character varying(12) NOT NULL,
    user_id character varying(12) NOT NULL,
    order_id character varying(12) NOT NULL,
    CONSTRAINT reviews_review_description_check CHECK (((char_length((review_description)::text) >= 20) AND (char_length((review_description)::text) <= 372)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    MAXVALUE 999999999999
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO postgres;

--
-- Name: user_information; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_information (
    user_id character varying(12) NOT NULL,
    email_address character varying(47) NOT NULL,
    full_name character varying(30) NOT NULL,
    password_hash character varying(350) NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    CONSTRAINT user_information_email_address_check CHECK ((char_length((email_address)::text) > 12)),
    CONSTRAINT user_information_full_name_check CHECK ((char_length((full_name)::text) > 3)),
    CONSTRAINT user_information_password_hash_check CHECK ((char_length((password_hash)::text) > 5))
);


ALTER TABLE public.user_information OWNER TO postgres;

--
-- Data for Name: delivery_information; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_information (delivery_id, order_id, delivery_address, eta_initial_seconds, eta_travel_seconds, eta_prep_seconds, eta_total_seconds, eta_distance_meters, eta_last_updated, delivery_state, created_at) FROM stdin;
\.


--
-- Data for Name: item_information; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_information (item_id, item_price, item_name, discount, restriction, item_description, allergen_description, image, category) FROM stdin;
000000000014	10.00	Pasta Chicken Parmesan	0.00	3	Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.	There are no allergens in this item	/public/Pasta-Chicken-Parmesan.png	pasta
000000000015	10.00	Penne all'arrabiata(spicy)	0.00	3	Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.	There are no allergens in this item	/public/Penne-all'arrabiata(spicy).png	pasta
000000000016	10.00	Penne all'arrabiata	0.00	3	Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.	There are no allergens in this item	/public/Penne-all'arrabiata.png	pasta
000000000003	10.00	Chichen Shawarma	0.00	3	Generous portions with tender chicken thigh shawarma with our special Middle Eastern spices, Served over homemade pita bread and our special garlic sauce.	There are no allergens in this item	/public/Chichen-Shawarma.png	main-dishes
000000000002	10.00	Slowly Cooked roast Brisket with BBQ sauce	0.00	3	Mouthwatering generous pieces of beef Brisket Cooked over 8 hours seasoned with our 8 hours seasoned with our special spices and coated with our BBQ sauce served with mashed potato,Yorkshire pudding,caramelised onions.	There are no allergens in this item	/public/Slowly-Cooked-roast-Brisket-with-BBQ-sauce.png	main-dishes
000000000010	10.00	5 garlic bread	0.00	3	Breaded toasted with butter	There are no allergens in this item	/public/5-garlic-bread.png	sides
000000000017	10.00	Philly cheesesteak sandwich(RIBEYE STEAK)	0.00	3	(RIBEYE STEAK) Trimmed and thinly sliced RIBEYE STEAK topped with cheese,carmalised onion and mayo sauce.	There are no allergens in this item	/public/Penne-all'arrabiata.png	sandwiches
000000000020	10.00	Home made Tzatziki with olive oil	0.00	3	Greek yoghurt with shredded 	There are no allergens in this item	/public/Chips.png	sides
000000000006	10.00	Special garlic sauce	0.00	3	Homemade garlic sauce	There are no allergens in this item	/public/Special-garlic-sauce.png	sides
000000000004	10.00	Chips	0.00	3	Regular size.	There are no allergens in this item	/public/Chips.png	sides
000000000005	10.00	sour cream and chives	0.00	3	Fresh Sour cream with chives.	There are no allergens in this item	/public/sour-cream-and-chives.png	sides
000000000008	2.50	French fries	0.00	3	Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.	There are no allergens in this item	/public/French-fries.png	sides
000000000007	10.00	Onion rings 10 pieces	0.00	3	10 pieces.	There are no allergens in this item	/public/Onion-rings-10-pieces.png	sides
000000000009	10.00	5 Cheesy garlic bread	0.00	3	5 breaded toasted with butter	There are no allergens in this item	/public/5-Cheesy-garlic-bread.png	sides
000000000021	7.90	Chicken Wings with BBQ Sauce	0.00	3	8 pieces of chicken wings 	There are no allergens in this item	/public/Chips.png	sides
000000000018	10.00	Chicken shawarama with garlic sauce	0.00	3	Generous portions of tender chicken thigh shawarma with our special Middle Eastern spices, Served in a full size baguette.	There are no allergens in this item	/public/Penne-all'arrabiata.png	sandwiches
000000000001	10.00	Slowly Cooked Roast Beef with Gravy	0.01	3	Mouthwatering generous pieces from joint beef cooked over 12 hours, with our special delicious gravy sauce, served with Yorkshire pudding and mixed vegetables.	There are no allergens in this item.	/public/Slowly-Cooked-Roast-Beef-with-Gravy.png	main-dishes
000000000019	10.00	Slowly cooked roast Brisket with BBQ sauce sandwich	0.00	3	Mouthwashing generous pieces of beef Brisket Cooked over 8 hours seasoned with our special spices and coated with our BBQ sauce, mixed with caramelised  onions and mushrooms	There are no allergens in this item	/public/Penne-all'arrabiata.png	sandwiches
000000000024	10.00	Fresh and healthy Greek salad and	0.00	3	(large bowl) Fresh and healthy Greek salad, with feta cheese, red onion,lettuce, cucumber, tomato and kalamata olive with drizzles of olive oil,herbs and lemon.	There are no allergens in this item	/public/Fresh-and-healthy-Greek-salad-and.png	salad
000000000025	10.00	Large bowl Caesar salad with grilled chicken	0.00	3	(large bowl) Caesar salad with lettuce, croutons , grilled chicken breast and drizzles of our homemade Caesar dressing.	There are no allergens in this item	/public/Large-bowl-Caesar-salad-with-grilled-chicken.png	salad
000000000013	10.00	Lasagna	0.00	3	Lasagna made with a rich meat sauce and a creamy bechamel sauce, with noodles and plenty of cheese.(the large size demonstrated in the photo)	There are no allergens in this item	/public/Lasagna.png	pasta
\.


--
-- Data for Name: purchase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase (order_id, item_id, user_id, quantity, total_transaction, order_state, timer_starttimestamp, timer_endtimestamp, order_timestamp) FROM stdin;
000000000001	000000000001	000000000003	1	9.90	pending	\N	\N	2026-01-23 15:45:30.452625
000000000002	000000000017	000000000003	1	10.00	pending	\N	\N	2026-01-23 15:45:35.97016
000000000003	000000000001	000000000002	1	9.90	pending	\N	\N	2026-01-28 15:06:55.334527
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (review_id, review_description, item_id, user_id, order_id) FROM stdin;
000000000011	wefsdgGasdgadzgaewsdggafafreyudffffff	000000000001	000000000002	000000000001
000000000012	Select * all saffsffasfdaaaaaa	000000000017	000000000002	000000000002
000000000013	saDFDFDFDFDFDFDFDFDFDFDFDFDFDFDFDFDFDFDFDFDFDFDFDFDFDF	000000000024	000000000002	000000000003
000000000014	DSSSSSFFFFFFFFEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEA	000000000013	000000000002	000000000005
000000000015	ADDDDFFVSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS	000000000004	000000000002	000000000006
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
-1ubDyqKEuyyqCo4pqQPvtRCNQhkV1AD	{"cookie":{"originalMaxAge":86400000,"expires":"2026-01-29T15:06:15.650Z","secure":false,"httpOnly":true,"path":"/"},"user":{"user_id":"000000000002","email_address":"exampleuser@gmail.com","full_name":"cool user","is_admin":false}}	2026-01-29 16:37:25
\.


--
-- Data for Name: user_information; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_information (user_id, email_address, full_name, password_hash, is_admin) FROM stdin;
000000000001	exampleadmin@gmail.com	cool admin	$2b$12$X.bYn8tR2eq.f6zeBU7CBOJ.XjpPRTZC5JPYTmEU5PNIZzi.anlsy	t
000000000002	exampleuser@gmail.com	cool user	$2b$12$X.bYn8tR2eq.f6zeBU7CBOJ.XjpPRTZC5JPYTmEU5PNIZzi.anlsy	f
000000000003	exampleuser1@gmail.com	cool1 user	$2b$12$X.bYn8tR2eq.f6zeBU7CBOJ.XjpPRTZC5JPYTmEU5PNIZzi.anlsy	f
000000000004	exampleuser2@gmail.com	cool2 user	$2b$12$X.bYn8tR2eq.f6zeBU7CBOJ.XjpPRTZC5JPYTmEU5PNIZzi.anlsy	f
000000000005	exampleuser3@gmail.com	cool3 user	$2b$12$X.bYn8tR2eq.f6zeBU7CBOJ.XjpPRTZC5JPYTmEU5PNIZzi.anlsy	f
\.


--
-- Name: delivery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.delivery_id_seq', 1, false);


--
-- Name: item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_id_seq', 25, true);


--
-- Name: order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_id_seq', 3, true);


--
-- Name: review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_id_seq', 16, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 5, true);


--
-- Name: delivery_information delivery_information_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_information
    ADD CONSTRAINT delivery_information_order_id_key UNIQUE (order_id);


--
-- Name: delivery_information delivery_information_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_information
    ADD CONSTRAINT delivery_information_pkey PRIMARY KEY (delivery_id);


--
-- Name: item_information item_information_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_information
    ADD CONSTRAINT item_information_pkey PRIMARY KEY (item_id);


--
-- Name: purchase purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase
    ADD CONSTRAINT purchase_pkey PRIMARY KEY (order_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: user_information user_information_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_information
    ADD CONSTRAINT user_information_pkey PRIMARY KEY (user_id);


--
-- Name: delivery_information delivery_information_generate_id; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER delivery_information_generate_id BEFORE INSERT ON public.delivery_information FOR EACH ROW EXECUTE FUNCTION public.generate_delivery_id();


--
-- Name: item_information item_delete_notify; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER item_delete_notify AFTER DELETE ON public.item_information FOR EACH ROW EXECUTE FUNCTION public.notify_item_change();


--
-- Name: item_information item_information_generate_id; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER item_information_generate_id BEFORE INSERT ON public.item_information FOR EACH ROW EXECUTE FUNCTION public.generate_item_id();


--
-- Name: item_information item_insert_notify; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER item_insert_notify AFTER INSERT ON public.item_information FOR EACH ROW EXECUTE FUNCTION public.notify_item_change();


--
-- Name: item_information item_update_notify; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER item_update_notify AFTER UPDATE ON public.item_information FOR EACH ROW EXECUTE FUNCTION public.notify_item_change();


--
-- Name: purchase purchase_generate_id; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER purchase_generate_id BEFORE INSERT ON public.purchase FOR EACH ROW EXECUTE FUNCTION public.generate_order_id();


--
-- Name: reviews reviews_generate_id; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER reviews_generate_id BEFORE INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.generate_review_id();


--
-- Name: user_information user_information_generate_id; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER user_information_generate_id BEFORE INSERT ON public.user_information FOR EACH ROW EXECUTE FUNCTION public.generate_user_id();


--
-- Name: delivery_information delivery_information_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_information
    ADD CONSTRAINT delivery_information_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.purchase(order_id) ON DELETE CASCADE;


--
-- Name: purchase purchase_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase
    ADD CONSTRAINT purchase_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item_information(item_id) ON DELETE CASCADE;


--
-- Name: purchase purchase_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase
    ADD CONSTRAINT purchase_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_information(user_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item_information(item_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict fXO2u6KNF35ONq0TRRI5wmpNApJzf2MpUlGglhjfDTS1kLvd1qwwZiIFvjv6APv

