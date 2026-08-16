export interface LocationIntelligenceResult {
  formatted_address: string;
  google_place_id: string;
  latitude: number;
  longitude: number;
  country: string;
  state: string;
  district: string;
  city: string;
  area: string;
  postal_code: string;
  fullAddress: string;
}

// 1. Comprehensive Curated India Places Database (Deep coverage of Andhra Pradesh, Telangana, and Major Indian Cities)
export const COMPREHENSIVE_INDIA_PLACES_DB: LocationIntelligenceResult[] = [
  // 0. Primary City Centers & Core Hubs (Checked First for exact city/locality matches)
  {
    formatted_address: 'Guntur City Center, Guntur, Andhra Pradesh 522002, India',
    google_place_id: 'ChIJ_guntur_city_center',
    latitude: 16.3067,
    longitude: 80.4365,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Guntur City Center',
    postal_code: '522002',
    fullAddress: 'Guntur City Center, Guntur, Andhra Pradesh 522002'
  },
  {
    formatted_address: 'SVN Colony, Guntur, Andhra Pradesh 522006, India',
    google_place_id: 'ChIJ_svn_colony_main_guntur',
    latitude: 16.3100,
    longitude: 80.4300,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'SVN Colony',
    postal_code: '522006',
    fullAddress: 'SVN Colony, Guntur, Andhra Pradesh 522006'
  },
  {
    formatted_address: 'Brodipet, Guntur, Andhra Pradesh 522002, India',
    google_place_id: 'ChIJ_brodipet_main_guntur',
    latitude: 16.3067,
    longitude: 80.4365,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Brodipet',
    postal_code: '522002',
    fullAddress: 'Brodipet, Guntur, Andhra Pradesh 522002'
  },
  {
    formatted_address: 'Arundelpet, Guntur, Andhra Pradesh 522002, India',
    google_place_id: 'ChIJ_arundelpet_main_guntur',
    latitude: 16.3050,
    longitude: 80.4380,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Arundelpet',
    postal_code: '522002',
    fullAddress: 'Arundelpet, Guntur, Andhra Pradesh 522002'
  },
  {
    formatted_address: 'Lakshmipuram, Guntur, Andhra Pradesh 522007, India',
    google_place_id: 'ChIJ_lakshmipuram_main_guntur',
    latitude: 16.3025,
    longitude: 80.4410,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Lakshmipuram',
    postal_code: '522007',
    fullAddress: 'Lakshmipuram, Guntur, Andhra Pradesh 522007'
  },
  {
    formatted_address: 'Vijayawada City Center, NTR District, Andhra Pradesh 520001, India',
    google_place_id: 'ChIJ_vijayawada_city_center',
    latitude: 16.5062,
    longitude: 80.6480,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'NTR District',
    city: 'Vijayawada',
    area: 'Vijayawada City Center',
    postal_code: '520001',
    fullAddress: 'Vijayawada City Center, NTR District, Andhra Pradesh 520001'
  },
  {
    formatted_address: 'Hyderabad City Center, Hyderabad, Telangana 500001, India',
    google_place_id: 'ChIJ_hyderabad_city_center',
    latitude: 17.3850,
    longitude: 78.4867,
    country: 'India',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Hyderabad',
    area: 'Hyderabad City Center',
    postal_code: '500001',
    fullAddress: 'Hyderabad City Center, Hyderabad, Telangana 500001'
  },
  {
    formatted_address: 'Visakhapatnam City Center, Visakhapatnam, Andhra Pradesh 530001, India',
    google_place_id: 'ChIJ_visakhapatnam_city_center',
    latitude: 17.7400,
    longitude: 83.3300,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    city: 'Visakhapatnam',
    area: 'Visakhapatnam City Center',
    postal_code: '530001',
    fullAddress: 'Visakhapatnam City Center, Visakhapatnam, Andhra Pradesh 530001'
  },
  {
    formatted_address: 'Amaravati Capital City, Guntur District, Andhra Pradesh 522237, India',
    google_place_id: 'ChIJ_amaravati_capital',
    latitude: 16.5131,
    longitude: 80.5165,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Amaravati',
    area: 'Amaravati Capital City',
    postal_code: '522237',
    fullAddress: 'Amaravati Capital City, Guntur District, Andhra Pradesh 522237'
  },

  // Andhra Pradesh - Universities, Colleges & Educational Hubs
  {
    formatted_address: 'K L Deemed to be University, Green Fields, Vaddeswaram, Mangalagiri Mandal, Guntur District, Andhra Pradesh 522502, India',
    google_place_id: 'ChIJ_klef_vaddeswaram_1',
    latitude: 16.4419,
    longitude: 80.6226,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Vaddeswaram',
    area: 'KL University Campus',
    postal_code: '522502',
    fullAddress: 'K L Deemed to be University, Green Fields, Vaddeswaram, Guntur District, Andhra Pradesh 522502'
  },
  {
    formatted_address: 'Acharya Nagarjuna University, Nagarjuna Nagar, Namburu, Guntur District, Andhra Pradesh 522510, India',
    google_place_id: 'ChIJ_anu_namburu_2',
    latitude: 16.3780,
    longitude: 80.5250,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Namburu',
    area: 'Nagarjuna Nagar',
    postal_code: '522510',
    fullAddress: 'Acharya Nagarjuna University, Nagarjuna Nagar, Namburu, Guntur District, Andhra Pradesh 522510'
  },
  {
    formatted_address: 'SRM University AP, Neerukonda, Mangalagiri Mandal, Guntur District, Andhra Pradesh 522502, India',
    google_place_id: 'ChIJ_srm_ap_neerukonda_3',
    latitude: 16.4620,
    longitude: 80.5080,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Neerukonda',
    area: 'SRM University AP Campus',
    postal_code: '522502',
    fullAddress: 'SRM University AP, Neerukonda, Mangalagiri Mandal, Guntur District, Andhra Pradesh 522502'
  },
  {
    formatted_address: 'VIT AP University, Inavolu, Amaravati, Guntur District, Andhra Pradesh 522237, India',
    google_place_id: 'ChIJ_vit_ap_inavolu_4',
    latitude: 16.4950,
    longitude: 80.4980,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Amaravati',
    area: 'Inavolu',
    postal_code: '522237',
    fullAddress: 'VIT AP University, Inavolu, Amaravati, Guntur District, Andhra Pradesh 522237'
  },
  {
    formatted_address: 'RVR & JC College of Engineering, Chowdavaram, Guntur, Andhra Pradesh 522019, India',
    google_place_id: 'ChIJ_rvrjc_chowdavaram_5',
    latitude: 16.2550,
    longitude: 80.3250,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Chowdavaram',
    postal_code: '522019',
    fullAddress: 'RVR & JC College of Engineering, Chowdavaram, Guntur, Andhra Pradesh 522019'
  },
  {
    formatted_address: 'Vignan University, Vadlamudi, Chebrolu Mandal, Guntur District, Andhra Pradesh 522213, India',
    google_place_id: 'ChIJ_vignan_vadlamudi_6',
    latitude: 16.2330,
    longitude: 80.5500,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Vadlamudi',
    area: 'Vignan University Campus',
    postal_code: '522213',
    fullAddress: 'Vignan University, Vadlamudi, Guntur District, Andhra Pradesh 522213'
  },
  {
    formatted_address: 'Bapatla Engineering College, GBC Road, Bapatla, Bapatla District, Andhra Pradesh 522101, India',
    google_place_id: 'ChIJ_bec_bapatla_7',
    latitude: 15.9040,
    longitude: 80.4680,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Bapatla',
    city: 'Bapatla',
    area: 'GBC Road',
    postal_code: '522101',
    fullAddress: 'Bapatla Engineering College, GBC Road, Bapatla, Andhra Pradesh 522101'
  },

  // Andhra Pradesh - Guntur Streets, Lanes & Localities
  {
    formatted_address: 'Kobaldpeta (Kobalpet / Kothapeta), Guntur, Andhra Pradesh 522002, India',
    google_place_id: 'ChIJ_kobaldpeta_guntur',
    latitude: 16.3045,
    longitude: 80.4400,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Kobaldpeta',
    postal_code: '522002',
    fullAddress: 'Kobaldpeta, Guntur, Andhra Pradesh 522002'
  },
  {
    formatted_address: 'Kothapeta (Kobal Peta), Guntur, Andhra Pradesh 522001, India',
    google_place_id: 'ChIJ_kothapeta_guntur',
    latitude: 16.3030,
    longitude: 80.4430,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Kothapeta',
    postal_code: '522001',
    fullAddress: 'Kothapeta, Guntur, Andhra Pradesh 522001'
  },
  {
    formatted_address: 'Arundelpet 1st to 20th Lane, Guntur, Andhra Pradesh 522002, India',
    google_place_id: 'ChIJ_arundelpet_guntur',
    latitude: 16.3050,
    longitude: 80.4380,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Arundelpet',
    postal_code: '522002',
    fullAddress: 'Arundelpet, Guntur, Andhra Pradesh 522002'
  },
  {
    formatted_address: 'Brodipeta 2nd Lane, Guntur, Andhra Pradesh 522002, India',
    google_place_id: 'ChIJ_brodipeta_2nd_guntur',
    latitude: 16.3067,
    longitude: 80.4365,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Brodipeta 2nd Lane',
    postal_code: '522002',
    fullAddress: 'Brodipeta 2nd Lane, Guntur, Andhra Pradesh 522002'
  },
  {
    formatted_address: 'Brodipeta 4th Lane, Guntur, Andhra Pradesh 522002, India',
    google_place_id: 'ChIJ_brodipeta_4th_guntur',
    latitude: 16.3075,
    longitude: 80.4370,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Brodipeta 4th Lane',
    postal_code: '522002',
    fullAddress: 'Brodipeta 4th Lane, Guntur, Andhra Pradesh 522002'
  },
  {
    formatted_address: 'Arundhatipeta Main Road, Guntur, Andhra Pradesh 522002, India',
    google_place_id: 'ChIJ_arundhatipeta_guntur_8',
    latitude: 16.3025,
    longitude: 80.4410,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Arundhatipeta',
    postal_code: '522002',
    fullAddress: 'Arundhatipeta Main Road, Guntur, Andhra Pradesh 522002'
  },
  {
    formatted_address: 'Rajarajeswari Towers, SVN Colony 6th Line, Guntur, Andhra Pradesh 522006, India',
    google_place_id: 'ChIJ_svn_colony_guntur_9',
    latitude: 16.3100,
    longitude: 80.4300,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'SVN Colony 6th Line',
    postal_code: '522006',
    fullAddress: 'Rajarajeswari Towers, SVN Colony 6th Line, Guntur, Andhra Pradesh 522006'
  },
  {
    formatted_address: 'Lakshmipuram Main Road, Guntur, Andhra Pradesh 522007, India',
    google_place_id: 'ChIJ_lakshmipuram_guntur_10',
    latitude: 16.3150,
    longitude: 80.4250,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Lakshmipuram',
    postal_code: '522007',
    fullAddress: 'Lakshmipuram Main Road, Guntur, Andhra Pradesh 522007'
  },
  {
    formatted_address: 'Vidya Nagar, Guntur, Andhra Pradesh 522007, India',
    google_place_id: 'ChIJ_vidyanagar_guntur_11',
    latitude: 16.3180,
    longitude: 80.4280,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Vidya Nagar',
    postal_code: '522007',
    fullAddress: 'Vidya Nagar, Guntur, Andhra Pradesh 522007'
  },
  {
    formatted_address: 'Brindavan Gardens, Guntur, Andhra Pradesh 522006, India',
    google_place_id: 'ChIJ_brindavan_guntur_12',
    latitude: 16.3120,
    longitude: 80.4340,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Brindavan Gardens',
    postal_code: '522006',
    fullAddress: 'Brindavan Gardens, Guntur, Andhra Pradesh 522006'
  },
  {
    formatted_address: 'Syamala Nagar, Guntur, Andhra Pradesh 522006, India',
    google_place_id: 'ChIJ_syamalanagar_guntur_13',
    latitude: 16.3140,
    longitude: 80.4380,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Syamala Nagar',
    postal_code: '522006',
    fullAddress: 'Syamala Nagar, Guntur, Andhra Pradesh 522006'
  },
  {
    formatted_address: 'Koritepad, Guntur, Andhra Pradesh 522007, India',
    google_place_id: 'ChIJ_koritepad_guntur_14',
    latitude: 16.3200,
    longitude: 80.4320,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Koritepad',
    postal_code: '522007',
    fullAddress: 'Koritepad, Guntur, Andhra Pradesh 522007'
  },
  {
    formatted_address: 'Pattabhipuram, Guntur, Andhra Pradesh 522006, India',
    google_place_id: 'ChIJ_pattabhipuram_guntur_15',
    latitude: 16.3080,
    longitude: 80.4320,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    area: 'Pattabhipuram',
    postal_code: '522006',
    fullAddress: 'Pattabhipuram, Guntur, Andhra Pradesh 522006'
  },
  {
    formatted_address: 'Tenali Main Road, Tenali, Guntur District, Andhra Pradesh 522201, India',
    google_place_id: 'ChIJ_tenali_guntur_16',
    latitude: 16.2430,
    longitude: 80.6400,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Tenali',
    area: 'Tenali Center',
    postal_code: '522201',
    fullAddress: 'Tenali Main Road, Tenali, Guntur District, Andhra Pradesh 522201'
  },
  {
    formatted_address: 'Mangalagiri Center, Mangalagiri, Guntur District, Andhra Pradesh 522503, India',
    google_place_id: 'ChIJ_mangalagiri_guntur_17',
    latitude: 16.4300,
    longitude: 80.5600,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Mangalagiri',
    area: 'Mangalagiri Town',
    postal_code: '522503',
    fullAddress: 'Mangalagiri Center, Mangalagiri, Guntur District, Andhra Pradesh 522503'
  },
  {
    formatted_address: 'Tadepalli, Guntur District, Andhra Pradesh 522501, India',
    google_place_id: 'ChIJ_tadepalli_guntur_18',
    latitude: 16.4850,
    longitude: 80.6050,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Tadepalli',
    area: 'Tadepalli Main Road',
    postal_code: '522501',
    fullAddress: 'Tadepalli, Guntur District, Andhra Pradesh 522501'
  },
  {
    formatted_address: 'Secretariat Road, Velagapudi, Amaravati Capital, Guntur District, Andhra Pradesh 522237, India',
    google_place_id: 'ChIJ_velagapudi_amaravati_19',
    latitude: 16.5200,
    longitude: 80.5150,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Amaravati',
    area: 'Velagapudi Secretariat',
    postal_code: '522237',
    fullAddress: 'Secretariat Road, Velagapudi, Amaravati Capital, Guntur District, Andhra Pradesh 522237'
  },

  // Andhra Pradesh - Vijayawada (NTR District)
  {
    formatted_address: 'VR Siddhartha Engineering College, Kanuru, Vijayawada, NTR District, Andhra Pradesh 520007, India',
    google_place_id: 'ChIJ_vrsiddhartha_vja_20',
    latitude: 16.4880,
    longitude: 80.6920,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'NTR District',
    city: 'Vijayawada',
    area: 'Kanuru',
    postal_code: '520007',
    fullAddress: 'VR Siddhartha Engineering College, Kanuru, Vijayawada, NTR District, Andhra Pradesh 520007'
  },
  {
    formatted_address: 'Benz Circle, MG Road, Vijayawada, NTR District, Andhra Pradesh 520010, India',
    google_place_id: 'ChIJ_benz_vja_21',
    latitude: 16.5062,
    longitude: 80.6480,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'NTR District',
    city: 'Vijayawada',
    area: 'Benz Circle',
    postal_code: '520010',
    fullAddress: 'Benz Circle, MG Road, Vijayawada, NTR District, Andhra Pradesh 520010'
  },
  {
    formatted_address: 'Patamata Main Road, Vijayawada, NTR District, Andhra Pradesh 520010, India',
    google_place_id: 'ChIJ_patamata_vja_22',
    latitude: 16.4980,
    longitude: 80.6550,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'NTR District',
    city: 'Vijayawada',
    area: 'Patamata',
    postal_code: '520010',
    fullAddress: 'Patamata Main Road, Vijayawada, NTR District, Andhra Pradesh 520010'
  },
  {
    formatted_address: 'Labbipet, MG Road, Vijayawada, NTR District, Andhra Pradesh 520010, India',
    google_place_id: 'ChIJ_labbipet_vja_23',
    latitude: 16.5020,
    longitude: 80.6380,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'NTR District',
    city: 'Vijayawada',
    area: 'Labbipet',
    postal_code: '520010',
    fullAddress: 'Labbipet, MG Road, Vijayawada, NTR District, Andhra Pradesh 520010'
  },
  {
    formatted_address: 'Governor Peta, Vijayawada, NTR District, Andhra Pradesh 520002, India',
    google_place_id: 'ChIJ_governorpeta_vja_24',
    latitude: 16.5120,
    longitude: 80.6280,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'NTR District',
    city: 'Vijayawada',
    area: 'Governor Peta',
    postal_code: '520002',
    fullAddress: 'Governor Peta, Vijayawada, NTR District, Andhra Pradesh 520002'
  },
  {
    formatted_address: 'Bhavanipuram, Vijayawada, NTR District, Andhra Pradesh 520012, India',
    google_place_id: 'ChIJ_bhavanipuram_vja_25',
    latitude: 16.5250,
    longitude: 80.5950,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'NTR District',
    city: 'Vijayawada',
    area: 'Bhavanipuram',
    postal_code: '520012',
    fullAddress: 'Bhavanipuram, Vijayawada, NTR District, Andhra Pradesh 520012'
  },
  {
    formatted_address: 'Gannavaram Airport Road, Vijayawada, Krishna District, Andhra Pradesh 521101, India',
    google_place_id: 'ChIJ_gannavaram_vja_26',
    latitude: 16.5380,
    longitude: 80.7950,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Krishna',
    city: 'Gannavaram',
    area: 'Airport Road',
    postal_code: '521101',
    fullAddress: 'Gannavaram Airport Road, Vijayawada, Krishna District, Andhra Pradesh 521101'
  },

  // Andhra Pradesh - Visakhapatnam (Vizag)
  {
    formatted_address: 'Gayatri Vidya Parishad (GVP) College of Engineering, Madhurawada, Visakhapatnam, Andhra Pradesh 530048, India',
    google_place_id: 'ChIJ_gvp_vizag_27',
    latitude: 17.8160,
    longitude: 83.3760,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    city: 'Visakhapatnam',
    area: 'Madhurawada',
    postal_code: '530048',
    fullAddress: 'Gayatri Vidya Parishad (GVP) College of Engineering, Madhurawada, Visakhapatnam, Andhra Pradesh 530048'
  },
  {
    formatted_address: 'GITAM Deemed to be University, Rushikonda, Visakhapatnam, Andhra Pradesh 530045, India',
    google_place_id: 'ChIJ_gitam_vizag_28',
    latitude: 17.7810,
    longitude: 83.3760,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    city: 'Visakhapatnam',
    area: 'Rushikonda',
    postal_code: '530045',
    fullAddress: 'GITAM Deemed to be University, Rushikonda, Visakhapatnam, Andhra Pradesh 530045'
  },
  {
    formatted_address: 'MVP Colony Sector 1, Visakhapatnam, Andhra Pradesh 530017, India',
    google_place_id: 'ChIJ_mvp_vizag_29',
    latitude: 17.7400,
    longitude: 83.3300,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    city: 'Visakhapatnam',
    area: 'MVP Colony',
    postal_code: '530017',
    fullAddress: 'MVP Colony Sector 1, Visakhapatnam, Andhra Pradesh 530017'
  },
  {
    formatted_address: 'Siripuram Junction, Visakhapatnam, Andhra Pradesh 530003, India',
    google_place_id: 'ChIJ_siripuram_vizag_30',
    latitude: 17.7200,
    longitude: 83.3160,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    city: 'Visakhapatnam',
    area: 'Siripuram',
    postal_code: '530003',
    fullAddress: 'Siripuram Junction, Visakhapatnam, Andhra Pradesh 530003'
  },
  {
    formatted_address: 'Gajuwaka Junction, Visakhapatnam, Andhra Pradesh 530026, India',
    google_place_id: 'ChIJ_gajuwaka_vizag_31',
    latitude: 17.6900,
    longitude: 83.2100,
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    city: 'Visakhapatnam',
    area: 'Gajuwaka',
    postal_code: '530026',
    fullAddress: 'Gajuwaka Junction, Visakhapatnam, Andhra Pradesh 530026'
  },

  // Telangana - Hyderabad & Educational Hubs
  {
    formatted_address: 'International Institute of Information Technology (IIIT Hyderabad), Gachibowli, Hyderabad, Telangana 500032, India',
    google_place_id: 'ChIJ_iiit_hyd_32',
    latitude: 17.4455,
    longitude: 78.3489,
    country: 'India',
    state: 'Telangana',
    district: 'Rangareddy',
    city: 'Hyderabad',
    area: 'Gachibowli',
    postal_code: '500032',
    fullAddress: 'IIIT Hyderabad, Gachibowli, Hyderabad, Telangana 500032'
  },
  {
    formatted_address: 'Indian School of Business (ISB), Gachibowli, Hyderabad, Telangana 500111, India',
    google_place_id: 'ChIJ_isb_hyd_33',
    latitude: 17.4300,
    longitude: 78.3410,
    country: 'India',
    state: 'Telangana',
    district: 'Rangareddy',
    city: 'Hyderabad',
    area: 'Gachibowli ISB Campus',
    postal_code: '500111',
    fullAddress: 'Indian School of Business (ISB), Gachibowli, Hyderabad, Telangana 500111'
  },
  {
    formatted_address: 'Chaitanya Bharathi Institute of Technology (CBIT), Gandipet, Hyderabad, Telangana 500075, India',
    google_place_id: 'ChIJ_cbit_hyd_34',
    latitude: 17.3920,
    longitude: 78.3190,
    country: 'India',
    state: 'Telangana',
    district: 'Rangareddy',
    city: 'Hyderabad',
    area: 'Gandipet',
    postal_code: '500075',
    fullAddress: 'Chaitanya Bharathi Institute of Technology (CBIT), Gandipet, Hyderabad, Telangana 500075'
  },
  {
    formatted_address: 'VNR Vignana Jyothi Institute of Engineering and Technology, Bachupally, Hyderabad, Telangana 500090, India',
    google_place_id: 'ChIJ_vnrvjiet_hyd_35',
    latitude: 17.5380,
    longitude: 78.3840,
    country: 'India',
    state: 'Telangana',
    district: 'Medchal-Malkajgiri',
    city: 'Hyderabad',
    area: 'Bachupally',
    postal_code: '500090',
    fullAddress: 'VNR VJIET, Bachupally, Hyderabad, Telangana 500090'
  },
  {
    formatted_address: 'Gokaraju Rangaraju Institute of Engineering and Technology (GRIET), Bachupally, Hyderabad, Telangana 500090, India',
    google_place_id: 'ChIJ_griet_hyd_36',
    latitude: 17.5250,
    longitude: 78.3880,
    country: 'India',
    state: 'Telangana',
    district: 'Medchal-Malkajgiri',
    city: 'Hyderabad',
    area: 'Bachupally',
    postal_code: '500090',
    fullAddress: 'GRIET, Bachupally, Hyderabad, Telangana 500090'
  },
  {
    formatted_address: 'Road No 36, Jubilee Hills, Hyderabad, Telangana 500033, India',
    google_place_id: 'ChIJ_road36_jubilee_hyd',
    latitude: 17.4350,
    longitude: 78.4020,
    country: 'India',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Hyderabad',
    area: 'Jubilee Hills Road No 36',
    postal_code: '500033',
    fullAddress: 'Road No 36, Jubilee Hills, Hyderabad, Telangana 500033'
  },
  {
    formatted_address: 'Road No 45, Jubilee Hills, Hyderabad, Telangana 500033, India',
    google_place_id: 'ChIJ_road45_jubilee_hyd',
    latitude: 17.4326,
    longitude: 78.4071,
    country: 'India',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Hyderabad',
    area: 'Jubilee Hills Road No 45',
    postal_code: '500033',
    fullAddress: 'Road No 45, Jubilee Hills, Hyderabad, Telangana 500033'
  },
  {
    formatted_address: 'Road No 12, Banjara Hills, Hyderabad, Telangana 500034, India',
    google_place_id: 'ChIJ_road12_banjara_hyd',
    latitude: 17.4156,
    longitude: 78.4347,
    country: 'India',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Hyderabad',
    area: 'Banjara Hills Road No 12',
    postal_code: '500034',
    fullAddress: 'Road No 12, Banjara Hills, Hyderabad, Telangana 500034'
  },
  {
    formatted_address: 'HITEC City Phase 2, Madhapur, Hyderabad, Telangana 500081, India',
    google_place_id: 'ChIJ_hitec_madhapur_hyd',
    latitude: 17.4483,
    longitude: 78.3741,
    country: 'India',
    state: 'Telangana',
    district: 'Rangareddy',
    city: 'Hyderabad',
    area: 'Madhapur',
    postal_code: '500081',
    fullAddress: 'HITEC City Phase 2, Madhapur, Hyderabad, Telangana 500081'
  },
  {
    formatted_address: 'Financial District, Nanakramguda, Gachibowli, Hyderabad, Telangana 500032, India',
    google_place_id: 'ChIJ_financial_dist_hyd',
    latitude: 17.4150,
    longitude: 78.3450,
    country: 'India',
    state: 'Telangana',
    district: 'Rangareddy',
    city: 'Hyderabad',
    area: 'Financial District',
    postal_code: '500032',
    fullAddress: 'Financial District, Nanakramguda, Hyderabad, Telangana 500032'
  },

  // Karnataka - Bengaluru
  {
    formatted_address: 'Prestige Shantiniketan, Whitefield, Bengaluru, Karnataka 560048, India',
    google_place_id: 'ChIJ_whitefield_blr_37',
    latitude: 12.9863,
    longitude: 77.7523,
    country: 'India',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    city: 'Bengaluru',
    area: 'Whitefield',
    postal_code: '560048',
    fullAddress: 'Prestige Shantiniketan, Whitefield, Bengaluru, Karnataka 560048'
  },
  {
    formatted_address: '4th Block, Koramangala, Bengaluru, Karnataka 560034, India',
    google_place_id: 'ChIJ_kora_blr_38',
    latitude: 12.9352,
    longitude: 77.6245,
    country: 'India',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    city: 'Bengaluru',
    area: 'Koramangala',
    postal_code: '560034',
    fullAddress: '4th Block, Koramangala, Bengaluru, Karnataka 560034'
  },

  // Maharashtra - Mumbai & Pune
  {
    formatted_address: 'Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076, India',
    google_place_id: 'ChIJ_powai_mum_39',
    latitude: 19.1197,
    longitude: 72.9051,
    country: 'India',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    city: 'Mumbai',
    area: 'Powai',
    postal_code: '400076',
    fullAddress: 'Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076'
  },
  {
    formatted_address: 'Kalyani Nagar, Pune, Maharashtra 411014, India',
    google_place_id: 'ChIJ_kalyani_pune_40',
    latitude: 18.5463,
    longitude: 73.9033,
    country: 'India',
    state: 'Maharashtra',
    district: 'Pune',
    city: 'Pune',
    area: 'Kalyani Nagar',
    postal_code: '411014',
    fullAddress: 'Kalyani Nagar, Pune, Maharashtra 411014'
  },

  // Delhi NCR
  {
    formatted_address: 'DLF Cyber City, Phase 2, Gurugram, Haryana 122002, India',
    google_place_id: 'ChIJ_cyber_ggn_41',
    latitude: 28.4950,
    longitude: 77.0895,
    country: 'India',
    state: 'Haryana',
    district: 'Gurugram',
    city: 'Gurugram',
    area: 'DLF Cyber City',
    postal_code: '122002',
    fullAddress: 'DLF Cyber City, Phase 2, Gurugram, Haryana 122002'
  },
  {
    formatted_address: 'Connaught Place, New Delhi, Delhi 110001, India',
    google_place_id: 'ChIJ_cp_delhi_42',
    latitude: 28.6304,
    longitude: 77.2177,
    country: 'India',
    state: 'Delhi NCR',
    district: 'New Delhi',
    city: 'New Delhi',
    area: 'Connaught Place',
    postal_code: '110001',
    fullAddress: 'Connaught Place, New Delhi, Delhi 110001'
  },

  // Tamil Nadu - Chennai
  {
    formatted_address: '2nd Avenue, Anna Nagar, Chennai, Tamil Nadu 600040, India',
    google_place_id: 'ChIJ_annanagar_chn_43',
    latitude: 13.0850,
    longitude: 80.2101,
    country: 'India',
    state: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
    area: 'Anna Nagar',
    postal_code: '600040',
    fullAddress: '2nd Avenue, Anna Nagar, Chennai, Tamil Nadu 600040'
  }
];

// 2. Intelligent Synchronous Keyword & Substring Parser (Instant Fallback)
export const parseIndiaLocation = (query: string, defaultLat = 16.3067, defaultLng = 80.4365): LocationIntelligenceResult => {
  const q = query ? query.toLowerCase().trim() : '';

  if (!q) {
    return {
      formatted_address: 'All Locations',
      google_place_id: 'all_locations',
      latitude: defaultLat,
      longitude: defaultLng,
      country: 'India',
      state: '',
      district: '',
      city: '',
      area: '',
      postal_code: '',
      fullAddress: 'All Locations'
    };
  }

  // Tier 1: Check for EXACT city, area, district, or address match
  const exactMatch = COMPREHENSIVE_INDIA_PLACES_DB.find(
    p => p.city.toLowerCase() === q || p.area.toLowerCase() === q || p.district.toLowerCase() === q || p.formatted_address.toLowerCase() === q
  );
  if (exactMatch) {
    return { ...exactMatch };
  }

  // Tier 2: Check if area or city starts with or equals query
  const prefixMatch = COMPREHENSIVE_INDIA_PLACES_DB.find(
    p => p.area.toLowerCase().startsWith(q) || p.city.toLowerCase().startsWith(q) || q.includes(p.area.toLowerCase()) || q.includes(p.city.toLowerCase())
  );
  if (prefixMatch) {
    return { ...prefixMatch };
  }

  // Tier 3: Check substring match in area or city
  const areaCityMatch = COMPREHENSIVE_INDIA_PLACES_DB.find(
    p => p.area.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
  );
  if (areaCityMatch) {
    return { ...areaCityMatch };
  }

  // Tier 4: Fallback to substring in formatted_address
  const addressMatch = COMPREHENSIVE_INDIA_PLACES_DB.find(
    p => p.formatted_address.toLowerCase().includes(q)
  );
  if (addressMatch) {
    return { ...addressMatch };
  }

  // Geographic Keyword Mapping Dictionary
  let state = 'Andhra Pradesh';
  let district = 'Guntur';
  let city = 'Guntur';
  let postal_code = '522002';
  let lat = defaultLat;
  let lng = defaultLng;

  // Andhra Pradesh - KL University / Vaddeswaram / Mangalagiri / Amaravati / Namburu / Tenali
  if (q.includes('kl') || q.includes('klef') || q.includes('vaddeswaram') || q.includes('mangalagiri') || q.includes('srm') || q.includes('neerukonda') || q.includes('vit ap') || q.includes('inavolu') || q.includes('amaravati') || q.includes('velagapudi') || q.includes('namburu') || q.includes('nagarjuna university') || q.includes('tenali') || q.includes('tadepalli') || q.includes('undavalli')) {
    state = 'Andhra Pradesh';
    district = 'Guntur';
    city = q.includes('vaddeswaram') || q.includes('kl') ? 'Vaddeswaram' : (q.includes('mangalagiri') || q.includes('srm') ? 'Mangalagiri' : (q.includes('amaravati') || q.includes('vit') ? 'Amaravati' : 'Guntur'));
    postal_code = q.includes('vaddeswaram') || q.includes('kl') || q.includes('srm') ? '522502' : (q.includes('amaravati') || q.includes('vit') ? '522237' : (q.includes('tenali') ? '522201' : '522503'));
    lat = q.includes('vaddeswaram') || q.includes('kl') ? 16.4419 : (q.includes('srm') ? 16.4620 : (q.includes('vit') || q.includes('amaravati') ? 16.4950 : 16.4300));
    lng = q.includes('vaddeswaram') || q.includes('kl') ? 80.6226 : (q.includes('srm') ? 80.5080 : (q.includes('vit') || q.includes('amaravati') ? 80.4980 : 80.5600));
  }
  // Andhra Pradesh - Guntur City & Surrounding
  else if (q.includes('guntur') || q.includes('brodipet') || q.includes('arundhatipet') || q.includes('svn colony') || q.includes('lakshmipuram') || q.includes('vidya nagar') || q.includes('brindavan') || q.includes('syamala nagar') || q.includes('koritepad') || q.includes('pattabhipuram') || q.includes('rvr') || q.includes('vignan') || q.includes('bapatla') || q.includes('narasaraopet') || q.includes('chilakaluripet') || q.includes('nalanda') || q.includes('nethaji')) {
    state = 'Andhra Pradesh';
    district = 'Guntur';
    city = 'Guntur';
    postal_code = q.includes('svn colony') || q.includes('brindavan') || q.includes('syamala') || q.includes('pattabhipuram') || q.includes('nalanda') || q.includes('nethaji') ? '522006' : (q.includes('lakshmipuram') || q.includes('vidya nagar') || q.includes('koritepad') ? '522007' : (q.includes('bapatla') ? '522101' : '522002'));
    lat = 16.3067;
    lng = 80.4365;
  }
  // Andhra Pradesh - Vijayawada
  else if (q.includes('vijayawada') || q.includes('ntr') || q.includes('benz circle') || q.includes('patamata') || q.includes('labbipet') || q.includes('governor peta') || q.includes('bhavanipuram') || q.includes('kanuru') || q.includes('siddhartha') || q.includes('gannavaram') || q.includes('poranki') || q.includes('penamaluru') || q.includes('machilipatnam')) {
    state = 'Andhra Pradesh';
    district = 'NTR District';
    city = 'Vijayawada';
    postal_code = q.includes('kanuru') || q.includes('siddhartha') ? '520007' : (q.includes('gannavaram') ? '521101' : '520010');
    lat = 16.5062;
    lng = 80.6480;
  }
  // Andhra Pradesh - Visakhapatnam (Vizag)
  else if (q.includes('visakhapatnam') || q.includes('vizag') || q.includes('mvp') || q.includes('gajuwaka') || q.includes('siripuram') || q.includes('rushikonda') || q.includes('madhurawada') || q.includes('gitam') || q.includes('gvp') || q.includes('bhimli') || q.includes('anakapalle') || q.includes('dwaraka nagar') || q.includes('seethammadhara')) {
    state = 'Andhra Pradesh';
    district = 'Visakhapatnam';
    city = 'Visakhapatnam';
    postal_code = q.includes('madhurawada') || q.includes('gvp') ? '530048' : (q.includes('rushikonda') || q.includes('gitam') ? '530045' : (q.includes('gajuwaka') ? '530026' : '530017'));
    lat = q.includes('madhurawada') ? 17.8160 : (q.includes('rushikonda') ? 17.7810 : (q.includes('gajuwaka') ? 17.6900 : 17.7400));
    lng = q.includes('madhurawada') || q.includes('rushikonda') ? 83.3760 : (q.includes('gajuwaka') ? 83.2100 : 83.3300);
  }
  // Andhra Pradesh - Other districts
  else if (q.includes('rajahmundry') || q.includes('east godavari') || q.includes('kakinada') || q.includes('amalapuram')) {
    state = 'Andhra Pradesh';
    district = 'East Godavari';
    city = 'Rajahmundry';
    postal_code = '533101';
    lat = 17.0005;
    lng = 81.8040;
  }
  else if (q.includes('eluru') || q.includes('bhimavaram') || q.includes('west godavari') || q.includes('tadepalligudem') || q.includes('tanuku') || q.includes('palakollu') || q.includes('narsapur')) {
    state = 'Andhra Pradesh';
    district = 'West Godavari';
    city = 'Bhimavaram';
    postal_code = '534201';
    lat = 16.5449;
    lng = 81.5212;
  }
  else if (q.includes('tirupati') || q.includes('chittoor') || q.includes('madanapalle') || q.includes('puttur')) {
    state = 'Andhra Pradesh';
    district = 'Tirupati';
    city = 'Tirupati';
    postal_code = '517501';
    lat = 13.6288;
    lng = 79.4192;
  }
  else if (q.includes('nellore') || q.includes('spsr nellore') || q.includes('kavali') || q.includes('gudur')) {
    state = 'Andhra Pradesh';
    district = 'SPSR Nellore';
    city = 'Nellore';
    postal_code = '524001';
    lat = 14.4426;
    lng = 79.9865;
  }
  else if (q.includes('kurnool') || q.includes('adoni') || q.includes('nandyal')) {
    state = 'Andhra Pradesh';
    district = 'Kurnool';
    city = 'Kurnool';
    postal_code = '518001';
    lat = 15.8281;
    lng = 78.0373;
  }
  else if (q.includes('anantapur') || q.includes('hindupur') || q.includes('gunthakal') || q.includes('tadipatri') || q.includes('dharmavaram')) {
    state = 'Andhra Pradesh';
    district = 'Anantapur';
    city = 'Anantapur';
    postal_code = '515001';
    lat = 14.6819;
    lng = 77.6006;
  }
  else if (q.includes('kadapa') || q.includes('proddatur') || q.includes('rayachoti')) {
    state = 'Andhra Pradesh';
    district = 'YSR Kadapa';
    city = 'Kadapa';
    postal_code = '516001';
    lat = 14.4746;
    lng = 78.8242;
  }
  else if (q.includes('ongole') || q.includes('prakasam') || q.includes('chirala') || q.includes('kandukur')) {
    state = 'Andhra Pradesh';
    district = 'Prakasam';
    city = 'Ongole';
    postal_code = '523001';
    lat = 15.5057;
    lng = 80.0499;
  }
  else if (q.includes('srikakulam') || q.includes('palasa') || q.includes('amdalavalasa')) {
    state = 'Andhra Pradesh';
    district = 'Srikakulam';
    city = 'Srikakulam';
    postal_code = '532001';
    lat = 18.2949;
    lng = 83.8938;
  }
  else if (q.includes('vizianagaram') || q.includes('bobbili') || q.includes('parvathipuram')) {
    state = 'Andhra Pradesh';
    district = 'Vizianagaram';
    city = 'Vizianagaram';
    postal_code = '535001';
    lat = 18.1067;
    lng = 83.3956;
  }
  // Telangana - Hyderabad & Educational Hubs
  else if (q.includes('hyderabad') || q.includes('jubilee hills') || q.includes('banjara hills') || q.includes('gachibowli') || q.includes('madhapur') || q.includes('kondapur') || q.includes('hitec city') || q.includes('kukatpally') || q.includes('secunderabad') || q.includes('iiit') || q.includes('isb') || q.includes('cbit') || q.includes('vnrvjiet') || q.includes('griet') || q.includes('bachupally') || q.includes('nanakramguda') || q.includes('financial district') || q.includes('telangana')) {
    state = 'Telangana';
    district = 'Hyderabad';
    city = 'Hyderabad';
    postal_code = q.includes('hitec') || q.includes('madhapur') ? '500081' : (q.includes('gachibowli') || q.includes('iiit') || q.includes('financial') ? '500032' : (q.includes('bachupally') || q.includes('vnrvjiet') || q.includes('griet') ? '500090' : '500033'));
    lat = q.includes('hitec') || q.includes('madhapur') ? 17.4483 : (q.includes('gachibowli') || q.includes('iiit') ? 17.4455 : (q.includes('bachupally') ? 17.5380 : 17.4326));
    lng = q.includes('hitec') || q.includes('madhapur') ? 78.3741 : (q.includes('gachibowli') || q.includes('iiit') ? 78.3489 : (q.includes('bachupally') ? 78.3840 : 78.4071));
  }
  // Karnataka
  else if (q.includes('bangalore') || q.includes('bengaluru') || q.includes('whitefield') || q.includes('koramangala') || q.includes('indiranagar') || q.includes('jayanagar') || q.includes('hsr layout') || q.includes('electronic city') || q.includes('karnataka')) {
    state = 'Karnataka';
    district = 'Bengaluru Urban';
    city = 'Bengaluru';
    postal_code = '560001';
    lat = 12.9716;
    lng = 77.5946;
  }
  // Maharashtra
  else if (q.includes('mumbai') || q.includes('bandra') || q.includes('andheri') || q.includes('juhu') || q.includes('worli') || q.includes('powai') || q.includes('thane') || q.includes('navi mumbai') || q.includes('maharashtra')) {
    state = 'Maharashtra';
    district = 'Mumbai Suburban';
    city = 'Mumbai';
    postal_code = '400050';
    lat = 19.0760;
    lng = 72.8777;
  }
  else if (q.includes('pune') || q.includes('kothrud') || q.includes('vimannagar') || q.includes('wakad') || q.includes('hinjewadi')) {
    state = 'Maharashtra';
    district = 'Pune';
    city = 'Pune';
    postal_code = '411001';
    lat = 18.5204;
    lng = 73.8567;
  }
  // Delhi NCR
  else if (q.includes('delhi') || q.includes('ncr') || q.includes('gurgaon') || q.includes('gurugram') || q.includes('noida') || q.includes('connaught place') || q.includes('dwarka') || q.includes('saket')) {
    state = 'Delhi NCR';
    district = 'New Delhi';
    city = 'New Delhi';
    postal_code = '110001';
    lat = 28.6139;
    lng = 77.2090;
  }
  // Tamil Nadu
  else if (q.includes('chennai') || q.includes('anna nagar') || q.includes('t nagar') || q.includes('velachery') || q.includes('adyar') || q.includes('guindy') || q.includes('tamil nadu')) {
    state = 'Tamil Nadu';
    district = 'Chennai';
    city = 'Chennai';
    postal_code = '600001';
    lat = 13.0827;
    lng = 80.2707;
  }
  // West Bengal
  else if (q.includes('kolkata') || q.includes('salt lake') || q.includes('new town') || q.includes('howrah') || q.includes('park street') || q.includes('ballygunge') || q.includes('west bengal')) {
    state = 'West Bengal';
    district = 'Kolkata';
    city = 'Kolkata';
    postal_code = '700016';
    lat = 22.5726;
    lng = 88.3639;
  }
  // Generic fallback: try to extract state from text or default to Andhra Pradesh
  else {
    if (q.includes('andhra pradesh') || q.includes('ap')) { state = 'Andhra Pradesh'; district = 'Guntur'; city = 'Guntur'; }
    else if (q.includes('telangana') || q.includes('ts')) { state = 'Telangana'; district = 'Hyderabad'; city = 'Hyderabad'; }
    else if (q.includes('karnataka') || q.includes('ka')) { state = 'Karnataka'; district = 'Bengaluru Urban'; city = 'Bengaluru'; }
    else if (q.includes('maharashtra') || q.includes('mh')) { state = 'Maharashtra'; district = 'Mumbai Suburban'; city = 'Mumbai'; }
    else if (q.includes('tamil nadu') || q.includes('tn')) { state = 'Tamil Nadu'; district = 'Chennai'; city = 'Chennai'; }
    else if (q.includes('kerala') || q.includes('kl')) { state = 'Kerala'; district = 'Ernakulam'; city = 'Kochi'; }
    else if (q.includes('gujarat') || q.includes('gj')) { state = 'Gujarat'; district = 'Ahmedabad'; city = 'Ahmedabad'; }
    else if (q.includes('rajasthan') || q.includes('rj')) { state = 'Rajasthan'; district = 'Jaipur'; city = 'Jaipur'; }
    else if (q.includes('uttar pradesh') || q.includes('up')) { state = 'Uttar Pradesh'; district = 'Lucknow'; city = 'Lucknow'; }
    else {
      state = 'Andhra Pradesh';
      district = 'Guntur';
      city = 'Guntur';
      postal_code = '522002';
    }
  }

  // Extract Area / Locality from query string
  const parts = query.split(',').map(s => s.trim()).filter(Boolean);
  let area = parts[0] || query || 'Central Area';

  // If there are no commas, but the string contains the city name (e.g. 'kobaldpeta guntur'), strip out city and state to get the exact area!
  if (parts.length === 1 && (query.toLowerCase().includes(city.toLowerCase()) || query.toLowerCase().includes('guntur') || query.toLowerCase().includes('vijayawada') || query.toLowerCase().includes('hyderabad') || query.toLowerCase().includes('visakhapatnam') || query.toLowerCase().includes('bengaluru') || query.toLowerCase().includes('mumbai') || query.toLowerCase().includes('delhi'))) {
    const cleaned = query.replace(new RegExp(`india|andhra pradesh|telangana|karnataka|maharashtra|${city}|guntur|vijayawada|hyderabad|visakhapatnam|bengaluru|mumbai|delhi|5\\d{5}`, 'gi'), '').trim();
    if (cleaned.length >= 2) {
      area = cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  if (parts.length >= 2 && !city.toLowerCase().includes(parts[1].toLowerCase())) {
    const potentialCity = parts[1].replace(/india|andhra pradesh|telangana|karnataka|maharashtra/gi, '').trim();
    if (potentialCity) {
      city = potentialCity;
      district = potentialCity;
    }
  }

  const formatted_address = parts.length >= 2 ? `${query}` : `${area}, ${city}, ${state} ${postal_code}, India`;

  return {
    formatted_address,
    google_place_id: `ChIJ_custom_${Math.abs(query.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0))}`,
    latitude: lat,
    longitude: lng,
    country: 'India',
    state,
    district,
    city,
    area,
    postal_code,
    fullAddress: formatted_address
  };
};

// 3. Live OpenStreetMap Nominatim Online Geocoding Engine (Real-Time Search for ANY Road/Street/College in India)
export const searchLivePlaces = async (query: string): Promise<LocationIntelligenceResult[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const q = query.toLowerCase().trim();
  const offlineMatches = COMPREHENSIVE_INDIA_PLACES_DB.filter(
    p => p.area.toLowerCase().includes(q) || p.formatted_address.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || q.includes(p.area.toLowerCase())
  );

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=in&limit=8`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const onlineResults: LocationIntelligenceResult[] = data.map((item: any, idx: number) => {
          const addr = item.address || {};
          const state = addr.state || 'Andhra Pradesh';
          const district = addr.state_district || addr.county || addr.district || addr.city || 'Guntur';
          const city = addr.city || addr.town || addr.municipality || addr.suburb || addr.village || district || 'Guntur';
          const area = addr.suburb || addr.neighbourhood || addr.road || addr.residential || addr.village || addr.amenity || query.split(',')[0] || city;
          let postal_code = addr.postcode || '522002';
          if (item.display_name.toLowerCase().includes('guntur') || query.toLowerCase().includes('guntur')) {
            if (item.display_name.toLowerCase().includes('svn colony') || item.display_name.toLowerCase().includes('brindavan') || item.display_name.toLowerCase().includes('syamala') || item.display_name.toLowerCase().includes('pattabhipuram') || item.display_name.toLowerCase().includes('nalanda') || item.display_name.toLowerCase().includes('nethaji') || query.toLowerCase().includes('nalanda') || query.toLowerCase().includes('nethaji') || query.toLowerCase().includes('svn colony') || query.toLowerCase().includes('pattabhipuram')) {
              postal_code = '522006';
            }
          }
          const lat = parseFloat(item.lat) || 16.3067;
          const lng = parseFloat(item.lon) || 80.4365;

          return {
            formatted_address: item.display_name,
            google_place_id: `osm_${item.place_id || idx}`,
            latitude: lat,
            longitude: lng,
            country: 'India',
            state,
            district,
            city,
            area,
            postal_code,
            fullAddress: item.display_name
          };
        });

        // Merge offline matches at the top with live online results without duplicates
        const combined = [...offlineMatches];
        onlineResults.forEach(online => {
          if (!combined.some(c => Math.abs(c.latitude - online.latitude) < 0.001 && Math.abs(c.longitude - online.longitude) < 0.001)) {
            combined.push(online);
          }
        });
        return combined;
      }
    }
  } catch (err) {
    console.warn('Nominatim live search error, falling back to offline DB:', err);
  }

  return offlineMatches.length > 0 ? offlineMatches : [parseIndiaLocation(query)];
};

// 4. Instant Online Geocode for Custom Addresses
export const geocodeLocationOnline = async (query: string): Promise<LocationIntelligenceResult> => {
  if (!query || !query.trim()) {
    return parseIndiaLocation('Hyderabad');
  }

  // Check if query is GPS coordinates (e.g. "17.4483, 78.3741")
  const coordsMatch = query.match(/^([-+]?\d{1,2}(?:\.\d+)?),\s*([-+]?\d{1,3}(?:\.\d+)?)$/);
  if (coordsMatch) {
    const lat = parseFloat(coordsMatch[1]);
    const lng = parseFloat(coordsMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return reverseGeocodeOnline(lat, lng);
    }
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=in&limit=1`, {
      headers: { 'Accept-Language': 'en' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const addr = item.address || {};
        const state = addr.state || addr.region || 'Telangana';
        const district = addr.state_district || addr.county || addr.district || addr.city || '';
        const city = addr.city || addr.town || addr.municipality || addr.suburb || addr.village || district || '';
        const area = addr.suburb || addr.neighbourhood || addr.road || addr.residential || addr.village || addr.amenity || query.split(',')[0] || city;
        const postal_code = addr.postcode || '';
        const lat = parseFloat(item.lat) || 17.3850;
        const lng = parseFloat(item.lon) || 78.4867;

        return {
          formatted_address: item.display_name,
          google_place_id: `osm_custom_${item.place_id || Date.now()}`,
          latitude: lat,
          longitude: lng,
          country: addr.country || 'India',
          state,
          district: district || city,
          city: city || 'Hyderabad',
          area: area || city || 'Locality',
          postal_code,
          fullAddress: item.display_name
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim geocode error, falling back to parseIndiaLocation:', err);
  }

  return parseIndiaLocation(query);
};

// 5. High-Precision Reverse Geocoding Engine for Dragged Markers & Live GPS
export const reverseGeocodeOnline = async (lat: number, lng: number): Promise<LocationIntelligenceResult> => {
  const latitude = Number(lat);
  const longitude = Number(lng);

  // 1. First attempt: BigDataCloud ultra-fast high-accuracy client reverse geocoder (100% free, no rate limit)
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      if (bdcData && (bdcData.city || bdcData.locality || bdcData.principalSubdivision)) {
        const city = bdcData.city || bdcData.locality || (bdcData.localityInfo?.administrative?.[2]?.name) || 'City';
        const area = bdcData.locality || bdcData.localityInfo?.administrative?.[3]?.name || city;
        const state = bdcData.principalSubdivision || 'Andhra Pradesh';
        const district = bdcData.localityInfo?.administrative?.[2]?.name || city;
        const postal_code = bdcData.postcode || '';
        const formatted_address = [area, city, district !== city ? district : '', state, postal_code, 'India'].filter(Boolean).join(', ');

        return {
          formatted_address,
          google_place_id: `bdc_rev_${Date.now()}`,
          latitude,
          longitude,
          country: bdcData.countryName || 'India',
          state,
          district,
          city,
          area,
          postal_code,
          fullAddress: formatted_address
        };
      }
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode error, trying Nominatim:', err);
  }

  // 2. Second attempt: OpenStreetMap Nominatim reverse geocode
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const state = addr.state || addr.region || 'Andhra Pradesh';
        const district = addr.state_district || addr.county || addr.district || addr.city || '';
        const city = addr.city || addr.town || addr.municipality || addr.suburb || addr.village || district || 'City';
        const area = addr.suburb || addr.neighbourhood || addr.road || addr.residential || addr.quarter || addr.village || addr.amenity || city;
        const postal_code = addr.postcode || '';
        const displayName = data.display_name || `${area}, ${city}, ${state} ${postal_code}, India`;

        return {
          formatted_address: displayName,
          google_place_id: `osm_rev_${data.place_id || Date.now()}`,
          latitude,
          longitude,
          country: addr.country || 'India',
          state,
          district: district || city,
          city,
          area,
          postal_code,
          fullAddress: displayName
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode error, using coordinate label:', err);
  }

  return {
    formatted_address: `Pinned Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
    google_place_id: `custom_rev_${Date.now()}`,
    latitude,
    longitude,
    country: 'India',
    state: '',
    district: '',
    city: '',
    area: 'Current Location',
    postal_code: '',
    fullAddress: `Pinned Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
  };
};

