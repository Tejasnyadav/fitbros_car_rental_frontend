import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicCar } from '../../../utils/public-cars';

export const dynamic = 'force-dynamic';

type CarPageProps = {
  params: Promise<{ id: string }>;
};

const getCarOrNotFound = async (id: string) => {
  const car = await getPublicCar(id);
  if (!car) {
    notFound();
  }
  return car;
};

export async function generateMetadata({ params }: CarPageProps): Promise<Metadata> {
  const { id } = await params;
  const car = await getPublicCar(id);
  if (!car) {
    return {
      title: 'Car Not Available',
      robots: { index: false, follow: true },
      alternates: { canonical: null },
    };
  }

  const title = `${car.name} Car Rental in Bangalore`;
  const description = `Rent the ${car.name} in Bengaluru from FitBros. ${car.type}, ${car.transmission}, from ₹${car.pricePerDay} per day.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/cars/${encodeURIComponent(car.id)}`,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      images: [car.image],
    },
  };
}

export default async function CarPage({ params }: CarPageProps) {
  const { id } = await params;
  const car = await getCarOrNotFound(id);

  return (
    <article className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
      <Link href="/#fleet" className="text-sm font-semibold text-yellow-400 hover:text-yellow-300">
        Browse the FitBros fleet
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-2 md:items-center">
        <Image
          src={car.image}
          alt={`${car.name} available for rent in Bengaluru`}
          width={1200}
          height={900}
          unoptimized
          fetchPriority="high"
          className="aspect-[4/3] h-auto w-full rounded-2xl border border-white/10 bg-neutral-900 object-cover"
        />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">
            {car.type} rental in Bengaluru
          </p>
          <h1 className="mt-3 font-luxury text-3xl font-extrabold text-white sm:text-4xl">
            Rent {car.name} in Bangalore
          </h1>
          <p className="mt-4 leading-relaxed text-gray-400">
            Book the {car.name} with FitBros Car Rental in Bengaluru. Check your dates and
            availability online before booking.
          </p>
          <p className="mt-6 text-2xl font-bold text-white">
            ₹{car.pricePerDay}
            <span className="ml-2 text-sm font-medium text-gray-400">per day</span>
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm">
            <div>
              <dt className="text-gray-500">Transmission</dt>
              <dd className="mt-1 font-semibold text-white">{car.transmission}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Fuel</dt>
              <dd className="mt-1 font-semibold text-white">{car.fuelType || 'Petrol'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Seats</dt>
              <dd className="mt-1 font-semibold text-white">{car.seatingCapacity || 5}</dd>
            </div>
          </dl>
          <Link
            href="/#fleet"
            className="mt-8 inline-flex rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition-colors hover:bg-yellow-300"
          >
            Check dates and book
          </Link>
        </div>
      </div>
    </article>
  );
}
