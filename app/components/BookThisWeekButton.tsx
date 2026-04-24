'use client';

import { useEffect, useMemo, useState } from 'react';

type BookThisWeekButtonProps = {
  destinationAirportCode: string;
  spotName: string;
  bestWindowStartDate: Date;
  bestWindowEndDate: Date;
  isBookable: boolean;
};

const CITY_TO_IATA: Record<string, string> = {
  // US East
  BOSTON: 'BOS', BOS: 'BOS',
  'NEW YORK': 'JFK', NYC: 'JFK', JFK: 'JFK', NEWARK: 'EWR', EWR: 'EWR', LAGUARDIA: 'LGA', LGA: 'LGA',
  WASHINGTON: 'DCA', DC: 'DCA', DCA: 'DCA', DULLES: 'IAD', IAD: 'IAD',
  PHILADELPHIA: 'PHL', PHILLY: 'PHL', PHL: 'PHL',
  MIAMI: 'MIA', MIA: 'MIA', 'FORT LAUDERDALE': 'FLL', FLL: 'FLL', ORLANDO: 'MCO', MCO: 'MCO',
  ATLANTA: 'ATL', ATL: 'ATL',
  CHARLOTTE: 'CLT', CLT: 'CLT',
  RALEIGH: 'RDU', RDU: 'RDU',
  // US Central
  CHICAGO: 'ORD', ORD: 'ORD', MIDWAY: 'MDW', MDW: 'MDW',
  MINNEAPOLIS: 'MSP', MSP: 'MSP',
  DETROIT: 'DTW', DTW: 'DTW',
  DALLAS: 'DFW', DFW: 'DFW',
  HOUSTON: 'IAH', IAH: 'IAH',
  AUSTIN: 'AUS', AUS: 'AUS',
  DENVER: 'DEN', DEN: 'DEN',
  NASHVILLE: 'BNA', BNA: 'BNA',
  // US West
  'LOS ANGELES': 'LAX', LA: 'LAX', LAX: 'LAX',
  'SAN FRANCISCO': 'SFO', SF: 'SFO', SFO: 'SFO',
  'SAN DIEGO': 'SAN', SAN: 'SAN',
  SEATTLE: 'SEA', SEA: 'SEA',
  PORTLAND: 'PDX', PDX: 'PDX',
  'LAS VEGAS': 'LAS', VEGAS: 'LAS', LAS: 'LAS',
  PHOENIX: 'PHX', PHX: 'PHX',
  'SALT LAKE CITY': 'SLC', SLC: 'SLC',
  HONOLULU: 'HNL', HAWAII: 'HNL', HNL: 'HNL',
  ANCHORAGE: 'ANC', ALASKA: 'ANC', ANC: 'ANC',
  // Canada
  TORONTO: 'YYZ', YYZ: 'YYZ',
  VANCOUVER: 'YVR', YVR: 'YVR',
  MONTREAL: 'YUL', YUL: 'YUL',
  CALGARY: 'YYC', YYC: 'YYC',
  // Europe
  LONDON: 'LHR', HEATHROW: 'LHR', LHR: 'LHR', GATWICK: 'LGW', LGW: 'LGW',
  PARIS: 'CDG', CDG: 'CDG', ORLY: 'ORY', ORY: 'ORY',
  AMSTERDAM: 'AMS', AMS: 'AMS',
  MADRID: 'MAD', MAD: 'MAD',
  BARCELONA: 'BCN', BCN: 'BCN',
  LISBON: 'LIS', LIS: 'LIS',
  ROME: 'FCO', FCO: 'FCO',
  MILAN: 'MXP', MXP: 'MXP',
  FRANKFURT: 'FRA', FRA: 'FRA',
  MUNICH: 'MUC', MUC: 'MUC',
  BERLIN: 'BER', BER: 'BER',
  ZURICH: 'ZRH', ZRH: 'ZRH',
  GENEVA: 'GVA', GVA: 'GVA',
  VIENNA: 'VIE', VIE: 'VIE',
  DUBLIN: 'DUB', DUB: 'DUB',
  OSLO: 'OSL', OSL: 'OSL',
  STOCKHOLM: 'ARN', ARN: 'ARN',
  COPENHAGEN: 'CPH', CPH: 'CPH',
  HELSINKI: 'HEL', HEL: 'HEL',
  REYKJAVIK: 'KEF', KEF: 'KEF', ICELAND: 'KEF',
  // Asia
  TOKYO: 'HND', HND: 'HND', NARITA: 'NRT', NRT: 'NRT',
  OSAKA: 'KIX', KIX: 'KIX',
  SEOUL: 'ICN', ICN: 'ICN',
  'HONG KONG': 'HKG', HKG: 'HKG',
  SHANGHAI: 'PVG', PVG: 'PVG',
  BEIJING: 'PEK', PEK: 'PEK',
  SINGAPORE: 'SIN', SIN: 'SIN',
  BANGKOK: 'BKK', BKK: 'BKK',
  BALI: 'DPS', DPS: 'DPS', DENPASAR: 'DPS',
  JAKARTA: 'CGK', CGK: 'CGK',
  MANILA: 'MNL', MNL: 'MNL',
  TAIPEI: 'TPE', TPE: 'TPE',
  'KUALA LUMPUR': 'KUL', KUL: 'KUL',
  DUBAI: 'DXB', DXB: 'DXB',
  DOHA: 'DOH', DOH: 'DOH',
  DELHI: 'DEL', DEL: 'DEL',
  MUMBAI: 'BOM', BOM: 'BOM',
  // Oceania
  SYDNEY: 'SYD', SYD: 'SYD',
  MELBOURNE: 'MEL', MEL: 'MEL',
  BRISBANE: 'BNE', BNE: 'BNE',
  PERTH: 'PER', PER: 'PER',
  AUCKLAND: 'AKL', AKL: 'AKL',
  WELLINGTON: 'WLG', WLG: 'WLG',
  QUEENSTOWN: 'ZQN', ZQN: 'ZQN',
  // Latin America
  'MEXICO CITY': 'MEX', MEX: 'MEX',
  CANCUN: 'CUN', CUN: 'CUN',
  'SAN JOSE': 'SJO', SJO: 'SJO', 'COSTA RICA': 'SJO',
  LIMA: 'LIM', LIM: 'LIM',
  SANTIAGO: 'SCL', SCL: 'SCL',
  'BUENOS AIRES': 'EZE', EZE: 'EZE',
  RIO: 'GIG', 'RIO DE JANEIRO': 'GIG', GIG: 'GIG',
  'SAO PAULO': 'GRU', GRU: 'GRU',
  BOGOTA: 'BOG', BOG: 'BOG',
  // Africa
  'CAPE TOWN': 'CPT', CPT: 'CPT',
  JOHANNESBURG: 'JNB', JNB: 'JNB',
  CAIRO: 'CAI', CAI: 'CAI',
  MARRAKECH: 'RAK', RAK: 'RAK',
  CASABLANCA: 'CMN', CMN: 'CMN',
  LAGOS: 'LOS', LOS: 'LOS',
};

function buildSkyscannerUrl(origin: string, dest: string, start: Date, end: Date): string {
  const fmt = (d: Date) => {
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return yy + mm + dd;
  };
  return `https://www.skyscanner.com/transport/flights/${origin.toLowerCase()}/${dest.toLowerCase()}/${fmt(start)}/${fmt(end)}/`;
}

function resolveOrigin(input: string): string | null {
  const normalized = input.trim().toUpperCase();
  const codeCandidate = normalized.slice(0, 3);
  if (/^[A-Z]{3}$/.test(codeCandidate) && normalized.length <= 3) return codeCandidate;
  if (CITY_TO_IATA[normalized]) return CITY_TO_IATA[normalized];
  if (/^[A-Z]{3}$/.test(codeCandidate)) return codeCandidate;
  return null;
}

export default function BookThisWeekButton({
  destinationAirportCode,
  spotName,
  bestWindowStartDate,
  bestWindowEndDate,
  isBookable,
}: BookThisWeekButtonProps) {
  const [origin, setOrigin] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('strike-mission:origin-airport');
    if (stored) setOrigin(stored.toUpperCase());
  }, []);

  const destination = useMemo(() => (destinationAirportCode || 'LAX').toUpperCase(), [destinationAirportCode]);

  const openSkyscanner = (resolvedOrigin: string) => {
    const url = buildSkyscannerUrl(resolvedOrigin, destination, new Date(bestWindowStartDate), new Date(bestWindowEndDate));
    window.open(url, '_blank');
  };

  const handleBook = () => {
    if (!isBookable) return;
    if (!origin) {
      setShowModal(true);
      setError(null);
      return;
    }
    openSkyscanner(origin);
  };

  const submitOrigin = () => {
    const resolved = resolveOrigin(modalInput);
    if (!resolved) {
      setError("Couldn't find that airport. Try a major city name (e.g. Tokyo, Lisbon) or a 3-letter IATA code (e.g. BOS, NRT).");
      return;
    }
    localStorage.setItem('strike-mission:origin-airport', resolved);
    setOrigin(resolved);
    setShowModal(false);
    setModalInput('');
    setError(null);
    openSkyscanner(resolved);
  };

  return (
    <>
      <div style={{ display: 'inline-block' }}>
        <button
          onClick={handleBook}
          disabled={!isBookable}
          title={!isBookable ? "Conditions don't warrant a trip right now" : undefined}
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            fontFamily: "'Georgia', serif",
            fontSize: '14px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: '#f0ebe0',
            color: '#0a0808',
            border: 'none',
            cursor: !isBookable ? 'not-allowed' : 'pointer',
            opacity: !isBookable ? 0.4 : 1,
          }}
        >
          Book this week
        </button>
        {origin && (
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: '#6b6560',
              textAlign: 'center',
            }}
          >
            Flying from {origin} ·{' '}
            <button
              onClick={() => {
                setOrigin(null);
                localStorage.removeItem('strike-mission:origin-airport');
                setModalInput('');
                setError(null);
                setShowModal(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b6560',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: 11,
                padding: 0,
                fontFamily: 'inherit',
              }}
            >
              change
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,8,8,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#0f0d0a',
              border: '1px solid #2a2520',
              borderRadius: 2,
              padding: 32,
              fontFamily: "'Georgia', serif",
            }}
          >
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6560' }}>
              Almost there
            </div>
            <h2 style={{ fontSize: 28, color: '#f0ebe0', margin: '8px 0 16px 0', lineHeight: 1.1 }}>
              Where are you flying from?
            </h2>
            <p style={{ fontSize: 14, color: '#6b6560', fontStyle: 'italic', margin: '0 0 24px 0' }}>
              Type a city name (e.g. Boston, Tokyo) or a 3-letter airport code. Autosaved for next time.
            </p>

            <input
              value={modalInput}
              onChange={(e) => {
                setModalInput(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitOrigin();
              }}
              placeholder="Type your city or airport code"
              style={{
                width: '100%',
                padding: '15px 16px',
                background: '#111010',
                border: '1px solid #6b6560',
                color: '#f0ebe0',
                fontFamily: "'Georgia', serif",
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {['BOS', 'JFK', 'LAX', 'LHR'].map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setModalInput(code);
                    setError(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid #2a2520',
                    color: '#f0ebe0',
                    fontSize: 12,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    letterSpacing: '0.06em',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget.style as CSSStyleDeclaration).borderColor = '#f0ebe0';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget.style as CSSStyleDeclaration).borderColor = '#2a2520';
                  }}
                >
                  {code}
                </button>
              ))}
            </div>

            {error && (
              <div style={{ marginTop: 12, color: '#fbbf24', fontSize: 12 }}>
                {error}
              </div>
            )}

            <button
              onClick={submitOrigin}
              style={{
                width: '100%',
                padding: 14,
                background: '#f0ebe0',
                color: '#0a0808',
                border: 'none',
                fontFamily: "'Georgia', serif",
                fontSize: 14,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginTop: 16,
                cursor: 'pointer',
              }}
            >
              Continue to Skyscanner →
            </button>

            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b6560',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: "'Georgia', serif",
                  padding: 0,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
