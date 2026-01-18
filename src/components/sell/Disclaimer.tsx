import { useApp } from '../../context/AppContext'

export function Disclaimer() {
    const { language } = useApp()

    return (
        <div style={{
            padding: 16,
            background: '#fef3c7',
            borderRadius: 12,
            marginBottom: 16,
            border: '1px solid #f59e0b'
        }}>
            <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
                ⚠️ {language === 'hi' ? 'अस्वीकरण' : 'Disclaimer'}
            </div>
            <p style={{ fontSize: 14, color: '#92400e', lineHeight: 1.5 }}>
                {language === 'hi'
                    ? 'यह प्लेटफॉर्म केवल खरीदार और विक्रेता को जोड़ने का काम करता है। लेन-देन, उत्पाद की गुणवत्ता, और भुगतान की जिम्मेदारी दोनों पक्षों की है। कृपया सामान देखकर और जाँच कर ही खरीदें।'
                    : 'This platform only connects buyers and sellers. Transaction, product quality, and payment responsibility lies with both parties. Please inspect the item before purchasing.'}
            </p>
        </div>
    )
}
