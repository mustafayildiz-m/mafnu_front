import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface PrivacyModalProps {
    show: boolean;
    handleClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ show, handleClose }) => {
    let lang: string = JSON.parse(localStorage.getItem('i18nConfig') || '{}').selectedLang || 'tr';

    const privacyText = {
        tr: (
            <>
                <p>
                    Tevfik Fikret Eğitim Vakfı ve Eğitim Kurumları tüm paydaşlarının temel hak ve özgürlüklerinin
                    korunmasına ve kişisel verilerinin güvenliği konusunu yüksek derecede önemsemektedir. Bu çerçevede,
                    TEVFİK FİKRET EĞİTİM VE ÖĞRETİM A.Ş., kendisi ile ilişkili tüm paydaşlara ait kişisel verilerin 6698
                    sayılı Kişisel Verilerin Korunması Kanunu'na uygun şekilde korunmasına özen gösterir. Bu Gizlilik
                    Sözleşmesi, kullanıcılarımızın kişisel verilerinin gizliliğini ve güvenliğini sağlama amacı taşır.
                    Bu Gizlilik Sözleşmesi ("Sözleşme"), uluslararası okullardan sempozyuma katılacak öğrenci ve kurul
                    üyelerinin "mafnu.tfo.k12.tr" sitesine kayıt sırasında paylaştığı kişisel verilerin ne şekilde
                    toplandığını, kullanıldığını, saklandığını ve korunduğunu açıklamaktadır.
                </p>
                <h5>1. KİŞİSEL VERİLERİN TOPLANMASI, İŞLENMESİ ve İŞLEME AMAÇLARI</h5>
                <p>
                    Sempozyuma kayıt yaptığınızda, aşağıda yer alan kişisel veriler tarafımızdan toplanabilir ve
                    işlenebilir:
                </p>
                <ul>
                    <li>Kimlik Bilgileri: Ad, soyad, öğrenci numarası, pasaport/kimlik numarası.</li>
                    <li>İletişim Bilgileri: E-posta adresi, telefon numarası, ikamet adresi.</li>
                    <li>Eğitim Bilgileri: Okul adı, bölüm, sınıf ve akademik bilgiler.</li>
                    <li>Diğer Bilgiler: Sempozyuma katılımla ilgili ek bilgiler ve tercihler.</li>
                </ul>
                <p>
                    Bu kişisel veriler, KVK Kanunu'nun 5 ve 6. maddelerine uygun olarak aşağıdaki amaçlarla işlenir:
                </p>
                <ul>
                    <li>Sempozyum kaydının oluşturulması ve onaylanması,</li>
                    <li>Sempozyum programına ilişkin bilgilendirmeler ve duyuruların iletilmesi,</li>
                    <li>Organizasyon süreci ile ilgili gerekli iletişim faaliyetlerinin yürütülmesi,</li>
                    <li>Yasal yükümlülüklerin yerine getirilmesi.</li>
                </ul>
                <h5>2. VERİLERİN SAKLANMASI, GÜVENLİĞİ VE AKTARIMI</h5>
                <p>
                    TEVFİK FİKRET EĞİTİM VE ÖĞRETİM A.Ş., kişisel verileri sempozyumun düzenlenmesi için iş ortakları,
                    tedarikçileri, Şirket yetkilileri, yazılım hizmeti alınan, kurumun verilerini işleyen ve saklayan
                    şirketler ve gizlilik sözleşmeleri ile güvenlik sağlanmak kaydı ile hizmet alınan gerçek ve tüzel
                    kişiler ve talep halinde kanunen yetkilendirilmiş kurumlar ile KVK Kanunu'nun 8 ve 9 numaralı
                    maddelerine uygun olarak ve amaçları doğrultusunda paylaşılabilmekte ve/veya aktarılabilmektedir.
                </p>
                <p>
                    TEVFİK FİKRET EĞİTİM VE ÖĞRETİM A.Ş. kişisel verileri kurumun veri tabanında KVK Kanunu'nun madde
                    12’ye göre saklayacak ve gizliliğin sağlanması konusunda gerekli tüm özeni gösterecektir. TEVFİK
                    FİKRET EĞİTİM VE ÖĞRETİM A.Ş. kişisel verileri KVK Kanunu'na aykırı olarak üçüncü kişilerle
                    paylaşmayacaktır.
                </p>
                <h5>3. KİŞİSEL VERİ SAHİBİNİN HAKLARI</h5>
                <p>
                    KVK Kanunu'nun 11. Maddesine göre kişisel veri sahipleri;
                </p>
                <ul>
                    <li>Kişisel veri işlenip işlenmediğini öğrenme</li>
                    <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme</li>
                    <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını
                        öğrenme,
                    </li>
                    <li>Yurtiçinde veya yurtdışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
                    <li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme ve bu
                        kapsamda yapılan işlemin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,
                    </li>
                    <li>İşlenen verilerin otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi
                        aleyhine bir sonucun ortaya çıkmasına itiraz etme,
                    </li>
                    <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması halinde zararın
                        giderilmesini talep etme haklarına sahiptir.
                    </li>
                </ul>
                <p>
                    KVK Kanunu'nun 13. Maddesinin 1. fıkrası gereğince, kişisel veri sahibi yukarıda belirtilen
                    haklarını kullanmak ile ilgili talebini, yazılı veya Kişisel Verileri Koruma Kurulu'nun belirlediği
                    diğer yöntemlerle TEVFİK FİKRET EĞİTİM VE ÖĞRETİM A.Ş.'e iletebilir. Kişisel veri sahibi yukarıda
                    belirtilen haklarını kullanmak için kimliğini tespit edici gerekli bilgiler ile KVK Kanunu'nun
                    11.maddesinde belirtilen haklardan kullanmayı talep ettiği takdirde hakkına yönelik açıklamaları
                    içeren taleplerini, yazılı ve imzalı dilekçe ile Mustafa Kemal Mahallesi, 2118. Cadde, No:6 Ankara
                    adresine bizzat teslim edebilir, noter kanalıyla veya iadeli taahhütlü mektupla iletebilir.
                </p>
                <h5>4. İLETİŞİM</h5>
                <p>
                    Kişisel verilerinizin işlenmesiyle ilgili her türlü sorunuz veya talepleriniz için
                    bilgiislem.tfo.k12.tr adresinden bize ulaşabilirsiniz.
                    Bu Gizlilik Sözleşmesi, kişisel verilerinizin gizliliğini ve güvenliğini sağlamak için özenle
                    hazırlanmıştır. Verilerinizin korunması konusunda gerekli önlemleri almaya devam edeceğiz.
                </p>
            </>
        ),
        fr:(
            <>
                <p>
                    La Fondation d'Éducation Tevfik Fikret et les Établissements d'Enseignement attachent une grande importance à la protection des droits et libertés fondamentaux de tous leurs partenaires ainsi qu'à la sécurité de leurs données personnelles. Dans ce cadre, TEVFIK FIKRET ÉDUCATION ET ENSEIGNEMENT S.A. veille à protéger les données personnelles de toutes les parties prenantes liées à elle conformément à la loi n° 6698 sur la protection des données personnelles. Cette Politique de Confidentialité vise à garantir la confidentialité et la sécurité des données personnelles de nos utilisateurs. Cette Politique de Confidentialité ("Politique") explique comment les données personnelles des étudiants et des membres de comité participant au symposium des écoles internationales sur le site "mafnu.tfo.k12.tr" sont collectées, utilisées, stockées et protégées.
                </p>
                <h5>1. COLLECTE, TRAITEMENT ET OBJECTIFS DU TRAITEMENT DES DONNÉES PERSONNELLES</h5>
                <p>
                    Lors de votre inscription au symposium, les données personnelles suivantes peuvent être collectées et traitées par nos soins :
                </p>
                <ul>
                    <li>Données d'identité : nom, prénom, numéro d'étudiant, numéro de passeport/carte d'identité.</li>
                    <li>Données de contact : adresse e-mail, numéro de téléphone, adresse de résidence.</li>
                    <li>Données éducatives : nom de l'école, département, classe et informations académiques.</li>
                    <li>Autres informations : informations supplémentaires et préférences relatives à la participation au symposium.</li>
                </ul>
                <p>
                    Ces données personnelles sont traitées conformément aux articles 5 et 6 de la loi sur la protection des données personnelles, aux fins suivantes :
                </p>
                <ul>
                    <li>Création et validation de l'inscription au symposium,</li>
                    <li>Transmission d'informations et d'annonces relatives au programme du symposium,</li>
                    <li>Exécution des activités de communication nécessaires dans le cadre du processus d'organisation,</li>
                    <li>Respect des obligations légales.</li>
                </ul>
                <h5>2. STOCKAGE, SÉCURITÉ ET TRANSFERT DES DONNÉES</h5>
                <p>
                    TEVFIK FIKRET ÉDUCATION ET ENSEIGNEMENT S.A. peut partager et/ou transférer les données personnelles avec des partenaires commerciaux, des fournisseurs, des responsables d'entreprise, des prestataires de services de logiciels, des entreprises traitant et stockant les données de l'institution, ainsi qu'avec des personnes physiques et morales bénéficiant d'accords de confidentialité garantissant la sécurité, et avec des institutions autorisées par la loi, conformément aux articles 8 et 9 de la loi sur la protection des données personnelles et aux fins de traitement.
                </p>
                <p>
                    TEVFIK FIKRET ÉDUCATION ET ENSEIGNEMENT S.A. conservera les données personnelles dans la base de données de l'institution conformément à l'article 12 de la loi sur la protection des données personnelles et prendra toutes les mesures nécessaires pour garantir leur confidentialité. TEVFIK FIKRET ÉDUCATION ET ENSEIGNEMENT S.A. ne partagera pas les données personnelles avec des tiers en violation de la loi sur la protection des données personnelles.
                </p>
                <h5>3. DROITS DU TITULAIRE DES DONNÉES PERSONNELLES</h5>
                <p>
                    Conformément à l'article 11 de la loi sur la protection des données personnelles, les titulaires de données personnelles ont les droits suivants :
                </p>
                <ul>
                    <li>Découvrir si les données personnelles ont été traitées,</li>
                    <li>Demander des informations si les données personnelles ont été traitées,</li>
                    <li>Connaître l'objectif du traitement des données personnelles et vérifier si elles sont utilisées conformément à cet objectif,</li>
                    <li>Savoir si les données personnelles sont transférées à des tiers dans le pays ou à l'étranger,</li>
                    <li>Demander la rectification des données personnelles si elles ont été traitées de manière incomplète ou incorrecte, et demander la notification de cette rectification aux tiers auxquels les données personnelles ont été transférées,</li>
                    <li>S'opposer à un résultat préjudiciable pour la personne elle-même, produit par l'analyse des données traitées exclusivement par des systèmes automatisés,</li>
                    <li>Demander une indemnisation en cas de dommage en raison du traitement illégal des données personnelles.</li>
                </ul>
                <p>
                    Conformément au paragraphe 1 de l'article 13 de la loi sur la protection des données personnelles, le titulaire des données peut adresser sa demande pour exercer ses droits susmentionnés à TEVFIK FIKRET ÉDUCATION ET ENSEIGNEMENT S.A. par écrit ou par d'autres moyens déterminés par le Conseil de protection des données personnelles. Le titulaire des données peut transmettre ses demandes accompagnées des informations d'identification nécessaires, ainsi que des explications sur les droits qu'il souhaite exercer, soit en personne au siège social situé à Mustafa Kemal Mahallesi, 2118. Cadde, No:6 Ankara, soit par courrier recommandé ou par acte notarié.
                </p>
                <h5>4. CONTACT</h5>
                <p>
                    Pour toute question ou demande concernant le traitement de vos données personnelles, vous pouvez nous contacter à l'adresse suivante : information@tfo.k12.tr.
                    Cette Politique de Confidentialité a été soigneusement préparée pour garantir la confidentialité et la sécurité de vos données personnelles. Nous continuerons de prendre les mesures nécessaires pour protéger vos données.
                </p>
            </>
        ),
        en: (
            <>
                <p>
                    Tevfik Fikret Education Foundation and Educational Institutions place great importance on protecting the fundamental rights and freedoms of all stakeholders, as well as the security of their personal data. In this context, TEVFIK FIKRET EDUCATION AND TRAINING INC. ensures that the personal data of all its stakeholders are protected in accordance with the Personal Data Protection Law No. 6698. This Privacy Policy aims to ensure the privacy and security of our users' personal data. This Privacy Policy ("Policy") explains how the personal data of students and committee members from international schools who will participate in the symposium are collected, used, stored, and protected during their registration on the "mafnu.tfo.k12.tr" website.
                </p>
                <h5>1. COLLECTION, PROCESSING, AND PURPOSES OF PROCESSING PERSONAL DATA</h5>
                <p>
                    When you register for the symposium, the following personal data may be collected and processed by us:
                </p>
                <ul>
                    <li>Identity Information: Name, surname, student number, passport/ID number.</li>
                    <li>Contact Information: Email address, phone number, residence address.</li>
                    <li>Educational Information: School name, department, class, and academic information.</li>
                    <li>Other Information: Additional information and preferences related to symposium participation.</li>
                </ul>
                <p>
                    This personal data is processed in accordance with Articles 5 and 6 of the Personal Data Protection Law, for the following purposes:
                </p>
                <ul>
                    <li>Creation and confirmation of symposium registration,</li>
                    <li>Transmission of information and announcements regarding the symposium program,</li>
                    <li>Execution of necessary communication activities related to the organization process,</li>
                    <li>Fulfillment of legal obligations.</li>
                </ul>
                <h5>2. DATA STORAGE, SECURITY, AND TRANSFER</h5>
                <p>
                    TEVFIK FIKRET EDUCATION AND TRAINING INC. may share and/or transfer personal data with business partners, suppliers, company officials, software service providers, companies processing and storing institutional data, and individuals and legal entities providing services under confidentiality agreements, as well as legally authorized institutions, in accordance with Articles 8 and 9 of the Personal Data Protection Law and for the intended purposes.
                </p>
                <p>
                    TEVFIK FIKRET EDUCATION AND TRAINING INC. will store personal data in the institution's database in accordance with Article 12 of the Personal Data Protection Law and will take all necessary measures to ensure confidentiality. TEVFIK FIKRET EDUCATION AND TRAINING INC. will not share personal data with third parties in violation of the Personal Data Protection Law.
                </p>
                <h5>3. RIGHTS OF THE PERSONAL DATA OWNER</h5>
                <p>
                    According to Article 11 of the Personal Data Protection Law, personal data owners have the following rights:
                </p>
                <ul>
                    <li>To learn whether personal data is being processed,</li>
                    <li>To request information if personal data has been processed,</li>
                    <li>To learn the purpose of processing personal data and whether it is used in accordance with its purpose,</li>
                    <li>To know the third parties to whom personal data is transferred domestically or abroad,</li>
                    <li>To request the correction of personal data if it has been processed incompletely or incorrectly, and to request that this correction be notified to third parties to whom personal data has been transferred,</li>
                    <li>To object to a result that arises against the person himself/herself through the analysis of processed data exclusively by automated systems,</li>
                    <li>To demand compensation for damages in case of illegal processing of personal data.</li>
                </ul>
                <p>
                    In accordance with paragraph 1 of Article 13 of the Personal Data Protection Law, the data owner may submit their request regarding the exercise of their above-mentioned rights to TEVFIK FIKRET EDUCATION AND TRAINING INC. in writing or by other means determined by the Personal Data Protection Board. The data owner may personally deliver their requests with the necessary identification information and explanations regarding the rights they wish to exercise, to Mustafa Kemal Mahallesi, 2118. Cadde, No:6 Ankara, or may send them by registered mail or through a notary.
                </p>
                <h5>4. CONTACT</h5>
                <p>
                    For any questions or requests regarding the processing of your personal data, you can reach us at information@tfo.k12.tr.
                    This Privacy Policy has been carefully prepared to ensure the confidentiality and security of your personal data. We will continue to take the necessary measures to protect your data.
                </p>
            </>
        )
    };
    const privacyTitle = {
        tr: 'Gizlilik Sözleşmesi',
        fr: 'Politique de Confidentialité',
        en: 'Privacy Policy'
    };
    const closeButtonText = {
        tr: 'Kapat',
        fr: 'Fermer',
        en: 'Close'
    };
    const selectedText = privacyText[lang as 'tr' | 'fr' | 'en'];
    const selectedTitle = privacyTitle[lang as 'tr' | 'fr' | 'en'];
    const selectedCloseText = closeButtonText[lang as 'tr' | 'fr' | 'en'];


    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{selectedTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{selectedText}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    {selectedCloseText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PrivacyModal;
