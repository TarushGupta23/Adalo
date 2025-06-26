import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, StarOff, ChevronDown, ChevronUp, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Example publications (will be fetched from API in production)
const publications = [
  {
    id: 1,
    name: "JCK Magazine",
    category: "magazine",
    url: "https://www.jckonline.com/",
    logo: "https://www.jckonline.com/wp-content/uploads/2022/01/JCK-Logo-Desktop.svg",
    description: "Jewelry industry news and trends from JCK Magazine."
  },
  {
    id: 2,
    name: "National Jeweler",
    category: "magazine",
    url: "https://www.nationaljeweler.com/",
    logo: "/assets/national-jeweler-logo.png",
    description: "Business news for the fine jewelry industry."
  },
  {
    id: 3, 
    name: "The Jewelry Cut",
    category: "substack",
    url: "https://thejewelrycut.substack.com/",
    logo: "/assets/substack-logo.png",
    description: "In-depth analysis of jewelry market trends and innovations."
  },
  {
    id: 4,
    name: "Gems & Design",
    category: "substack",
    url: "https://gemsanddesign.substack.com/",
    logo: "/assets/substack-logo.png",
    description: "Weekly insights on gemstone sourcing and jewelry design principles."
  },
  {
    id: 5,
    name: "INSTORE Magazine",
    category: "magazine",
    url: "https://instoremag.com/",
    logo: "/assets/instore-mag-logo.png",
    description: "For jewelry store owners and jewelry professionals."
  },
  {
    id: 6,
    name: "MJSA Journal",
    category: "magazine",
    url: "https://www.mjsa.org/publications/mjsa_journal",
    logo: "/assets/mjsa-logo.png",
    description: "Technical insights for jewelry makers and designers."
  }
];

// Example articles (will be fetched from API in production)
const articles = [
  {
    id: 1,
    publicationId: 1,
    title: "The Rise of Lab-Grown Diamonds in the Luxury Market",
    summary: "How lab-grown diamonds are capturing market share and changing consumer perceptions in the luxury segment.",
    date: "2025-05-15",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    content: `
    <h2>The Rise of Lab-Grown Diamonds in the Luxury Market</h2>
    <p class="text-sm text-gray-500 mb-4">Published on May 15, 2025 by JCK Magazine</p>
    
    <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" alt="Lab-grown diamonds" class="w-full rounded-lg mb-6" />
    
    <p class="mb-4">The jewelry industry is witnessing a significant shift as lab-grown diamonds continue their meteoric rise in the luxury market. Once considered alternatives primarily for price-conscious consumers, these manufactured stones are now gaining traction among luxury buyers and high-end designers.</p>
    
    <p class="mb-4">According to recent market research, lab-grown diamonds now account for approximately 18% of all diamond sales in the luxury segment, up from just 6% three years ago. This growth trajectory shows no signs of slowing, with projections suggesting they could represent up to 30% of the luxury diamond market by 2027.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Changing Consumer Perceptions</h3>
    
    <p class="mb-4">What's driving this change? Industry experts point to several key factors:</p>
    
    <ul class="list-disc pl-5 mb-4">
      <li class="mb-2"><strong>Ethical considerations</strong> - Luxury consumers increasingly prioritize transparency in sourcing</li>
      <li class="mb-2"><strong>Environmental awareness</strong> - Lab-grown diamonds have a smaller carbon footprint</li>
      <li class="mb-2"><strong>Technological advancements</strong> - Improvements in quality making them visually indistinguishable from mined diamonds</li>
      <li class="mb-2"><strong>Celebrity endorsements</strong> - High-profile figures openly choosing lab-grown options</li>
    </ul>
    
    <p class="mb-4">"What we're seeing is not just acceptance but genuine preference among certain luxury demographics," explains Sophia Chang, CEO of Diamond Market Analytics. "Particularly among younger affluent consumers, there's a perception that choosing lab-grown represents forward-thinking sophistication."</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Luxury Brands Responding</h3>
    
    <p class="mb-4">This shift hasn't gone unnoticed by luxury jewelry houses. While many traditional brands initially resisted the lab-grown movement, we're now seeing established names introducing lab-grown collections or incorporating these stones into their designs.</p>
    
    <p class="mb-4">LVMH-owned Tiffany & Co. made headlines this year with their "Future Heritage" collection featuring exclusively lab-grown stones, while Cartier has begun offering lab-grown options for certain pieces upon request.</p>
    
    <p class="mb-4">The pricing strategy for these luxury lab-grown pieces reveals an interesting dynamic. While lab-grown diamonds typically sell for 30-40% less than natural diamonds in the general market, the discount narrows significantly in the luxury segment, where the emphasis shifts from the stone's origin to design, craftsmanship, and brand heritage.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Looking Ahead</h3>
    
    <p class="mb-4">As manufacturing techniques continue to improve and consumer acceptance grows, the distinction between lab-grown and mined diamonds in the luxury market may continue to blur. The implications for traditional diamond mining, pricing structures, and marketing approaches are profound and likely to reshape the industry for decades to come.</p>
    
    <p class="mb-4">For retailers and designers, the message is clear: ignoring the lab-grown segment is no longer an option, even at the highest end of the market.</p>
    `
  },
  {
    id: 2,
    publicationId: 2,
    title: "Sustainable Practices in Jewelry Manufacturing",
    summary: "Industry leaders share eco-friendly approaches to jewelry production and sourcing.",
    date: "2025-05-10",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    content: `
    <h2>Sustainable Practices in Jewelry Manufacturing</h2>
    <p class="text-sm text-gray-500 mb-4">Published on May 10, 2025 by National Jeweler</p>
    
    <img src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" alt="Sustainable jewelry workshop" class="w-full rounded-lg mb-6" />
    
    <p class="mb-4">The jewelry industry is undergoing a green revolution as manufacturers across the globe implement sustainable practices in response to consumer demand and environmental imperatives. From sourcing recycled metals to redesigning workshop operations, jewelry makers are finding innovative ways to reduce their ecological footprint.</p>
    
    <p class="mb-4">In this special report, we showcase how industry leaders are setting new standards for eco-friendly jewelry production and the impact these changes are having on both their businesses and the environment.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Recycled Metals: The New Standard</h3>
    
    <p class="mb-4">According to the Responsible Jewelry Council, use of recycled precious metals has increased by 64% among certified members over the past five years. This shift significantly reduces the need for environmentally destructive mining processes.</p>
    
    <p class="mb-4">"We've completely transitioned to 100% recycled gold and silver in our collections," says Marco Bizzarri, head of production at Milan-based Aurelia Designs. "The quality is identical, but we've reduced our carbon footprint by approximately 58% just through this one change."</p>
    
    <p class="mb-4">Recycled metals now account for over 40% of all precious metals used in jewelry manufacturing globally, up from just 12% a decade ago.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Water Conservation Technologies</h3>
    
    <p class="mb-4">Water usage has long been a concern in jewelry manufacturing, particularly in casting and finishing processes. New closed-loop water systems are dramatically reducing consumption.</p>
    
    <p class="mb-4">"Our new filtering and recycling system has cut our water usage by 93%," explains Leila Wong, operations director at Hong Kong-based Golden Harbor Jewelry. "The initial investment was significant, but we've already seen return through reduced utility costs and alignment with our sustainability goals."</p>
    
    <p class="mb-4">Industry leaders are also implementing rainwater harvesting systems and drought-resistant landscaping at their facilities to further minimize water impact.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Solar-Powered Workshops</h3>
    
    <p class="mb-4">Energy consumption represents another area where jewelry manufacturers are making significant strides. Solar installations are becoming increasingly common, with some facilities achieving carbon-neutral status.</p>
    
    <p class="mb-4">"Our transition to solar power was completed last year," says Robert Keller of Keller & Sons in Rhode Island. "We now generate 115% of our energy needs and feed the excess back into the local grid. The system will pay for itself within four years."</p>
    
    <p class="mb-4">Beyond solar, manufacturers are also upgrading to energy-efficient equipment, installing LED lighting, and redesigning workshops to maximize natural light and ventilation.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Conclusion: The Business Case for Sustainability</h3>
    
    <p class="mb-4">While environmental concerns drive many of these changes, manufacturers are discovering compelling business reasons to embrace sustainability. Consumer preference for eco-friendly products continues to grow, with 68% of jewelry buyers under 40 saying environmental considerations influence their purchasing decisions.</p>
    
    <p class="mb-4">Additionally, sustainable practices often lead to cost savings over time through reduced resource consumption and waste. As the industry continues to evolve, sustainability is emerging not just as an ethical choice but as a strategic business imperative.</p>
    `
  },
  {
    id: 3,
    publicationId: 3,
    title: "Emerging Jewelry Designers to Watch in 2025",
    summary: "Meet the innovative new talents reshaping contemporary jewelry design with bold approaches.",
    date: "2025-05-18",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    content: `
    <h2>Emerging Jewelry Designers to Watch in 2025</h2>
    <p class="text-sm text-gray-500 mb-4">Published on May 18, 2025 by The Jewelry Cut</p>
    
    <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" alt="Contemporary jewelry design" class="w-full rounded-lg mb-6" />
    
    <p class="mb-4">The jewelry world is constantly evolving, with new designers bringing fresh perspectives and innovative techniques to the craft. This year, we're seeing an exciting crop of emerging talents whose work challenges conventions and expands our understanding of what jewelry can be. From unconventional materials to boundary-pushing concepts, these designers represent the cutting edge of contemporary jewelry creation.</p>
    
    <p class="mb-4">Here are five emerging designers whose work is capturing attention and setting new directions for the industry:</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">1. Mina Park (Seoul, South Korea)</h3>
    
    <p class="mb-4">A graduate of Central Saint Martins, Park's work explores the intersection of traditional Korean metalsmithing techniques and contemporary digital fabrication. Her "Digital Heritage" collection features intricate pieces that begin as 3D scans of historical Korean artifacts, which she then manipulates digitally before casting in recycled silver and gold.</p>
    
    <p class="mb-4">What makes Park's work particularly noteworthy is her seamless blending of ancient techniques with cutting-edge technology, creating pieces that feel simultaneously timeless and futuristic. Her recent exhibition at the Seoul Design Museum attracted international attention, with pieces now held in the permanent collection of the Victoria and Albert Museum in London.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">2. Gabriel Torres (Mexico City, Mexico)</h3>
    
    <p class="mb-4">Torres is pioneering the use of bioplastics in fine jewelry, creating biodegradable components that are integrated with precious metals and stones. His "Ephemera" collection challenges jewelry's association with permanence, featuring pieces designed to gradually transform over time.</p>
    
    <p class="mb-4">"I'm interested in jewelry that has a lifespan," Torres explains. "Most jewelry is designed to last forever, but I want to create pieces that change with the wearer, that have their own lifecycle."</p>
    
    <p class="mb-4">His innovative approach has earned him the prestigious Emerging Designer award at this year's International Jewelry Design Competition in Milan.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">3. Amara Okafor (Lagos, Nigeria)</h3>
    
    <p class="mb-4">Okafor's work draws on Nigeria's rich tradition of adornment while addressing contemporary social and political issues. Her "Extraction" series uses ethically sourced diamonds and gold set in sculptures that reference the environmental impact of mining industries in West Africa.</p>
    
    <p class="mb-4">Beyond their striking aesthetics, Okafor's pieces function as wearable commentary on resource extraction and post-colonial economics. Her work has been featured in exhibitions at the Museum of Modern Art in New York and the National Museum of African Art in Washington, D.C.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">4. Sasha Weinberg (Berlin, Germany)</h3>
    
    <p class="mb-4">Trained as an architect before turning to jewelry, Weinberg creates kinetic pieces that respond to the wearer's movement. Using micro-engineering principles, her articulated earrings, necklaces, and bracelets transform as they're worn, revealing new configurations throughout the day.</p>
    
    <p class="mb-4">"I'm designing for the dynamic body, not the static mannequin," says Weinberg. "Jewelry should be alive, responsive to the person wearing it."</p>
    
    <p class="mb-4">Her technically complex approach has attracted attention from both the jewelry and industrial design communities, with collaborations underway with several luxury fashion houses.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">5. Jin Zhao (Vancouver, Canada)</h3>
    
    <p class="mb-4">Zhao's work explores the relationship between digital and physical reality through jewelry that incorporates augmented reality elements. His physical pieces are designed to trigger digital experiences when viewed through a smartphone app, adding virtual elements to the tangible jewelry.</p>
    
    <p class="mb-4">"We live in dual realities now," Zhao suggests. "Our physical and digital selves are equally important, and our adornments should reflect that duality."</p>
    
    <p class="mb-4">While the AR components of Zhao's work have captured headlines, the physical craftsmanship of his pieces is equally impressive, featuring meticulous hand-engraving and stone-setting that stands on its own merits.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">The Future of Jewelry Design</h3>
    
    <p class="mb-4">What unites these diverse designers is their willingness to push boundaries and question traditions while maintaining a deep respect for craftsmanship. Their work suggests exciting new directions for jewelry as both adornment and art form.</p>
    
    <p class="mb-4">As the lines between technology, art, fashion, and social commentary continue to blur, these designers and others like them are ensuring that jewelry remains a vibrant, relevant medium for creative expression and cultural conversation.</p>
    `
  },
  {
    id: 4,
    publicationId: 5,
    title: "Digital Transformation: Jewelry Retail in the Metaverse",
    summary: "How virtual showrooms and NFT jewelry are creating new retail opportunities for traditional jewelers.",
    date: "2025-05-08",
    image: "https://images.unsplash.com/photo-1573408301428-9320db615ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    content: `
    <h2>Digital Transformation: Jewelry Retail in the Metaverse</h2>
    <p class="text-sm text-gray-500 mb-4">Published on May 8, 2025 by INSTORE Magazine</p>
    
    <img src="https://images.unsplash.com/photo-1573408301428-9320db615ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" alt="Digital jewelry showroom" class="w-full rounded-lg mb-6" />
    
    <p class="mb-4">The jewelry retail landscape is expanding into entirely new dimensions as established brands and independent jewelers explore opportunities in virtual worlds. From virtual showrooms to digital-only designs, the metaverse is emerging as the next frontier for jewelry retail—and early adopters are finding surprising success.</p>
    
    <p class="mb-4">This shift represents more than just a technological novelty. For many jewelers, digital platforms are becoming significant revenue streams and customer acquisition channels.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Virtual Showrooms: Beyond the Physical Store</h3>
    
    <p class="mb-4">Leading the digital transformation are immersive virtual showrooms that allow customers to experience jewelry in ways impossible in physical retail. Tiffany & Co. made headlines with its "Wonder Rooms" in Decentraland, featuring realistic 3D models of its collections that visitors can examine from any angle and even virtually try on.</p>
    
    <p class="mb-4">"We've seen conversion rates from our virtual showroom that exceed our brick-and-mortar locations," reveals Jennifer Cattaneo, Chief Digital Officer at Tiffany. "Visitors spend an average of 23 minutes in our virtual space, compared to 15 minutes in physical stores."</p>
    
    <p class="mb-4">Independent jewelers are also finding success with more accessible approaches to virtual retail. Using platforms like Spatial.io, smaller brands can create sophisticated virtual galleries without massive technology investments.</p>
    
    <p class="mb-4">"Our virtual showroom cost about the same as attending a major trade show, but it's open 24/7 and reaches clients globally," explains Marcos Duran of Duran Fine Jewelry in Madrid. "We've acquired customers from countries where we have no physical presence."</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Digital Twins: Bridging Physical and Virtual</h3>
    
    <p class="mb-4">Perhaps the most promising development for traditional jewelers is the "digital twin" concept—creating exact digital replicas of physical pieces that can be experienced virtually before purchase.</p>
    
    <p class="mb-4">Bulgari has pioneered this approach with its "Digital First" program, where clients can explore highly detailed digital models of high jewelry pieces from home before scheduling in-person viewings.</p>
    
    <p class="mb-4">"For exceptional pieces over $100,000, clients want time to consider their purchase," notes Alessandro Bogliolo, Bulgari's CEO. "Digital twins allow them this contemplative experience without the pressure of the sales environment. We've seen a 38% increase in appointment conversions since implementing this approach."</p>
    
    <p class="mb-4">The technology is becoming accessible to mid-market jewelers as well, with services like GemTwin offering digital twin creation for independent retailers.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">NFT Jewelry: Purely Digital Luxury</h3>
    
    <p class="mb-4">Perhaps most revolutionary is the emergence of purely digital jewelry designs sold as NFTs (Non-Fungible Tokens). These digital-only creations exist exclusively in virtual worlds yet command significant prices.</p>
    
    <p class="mb-4">Traditional houses like Cartier have experimented with limited-edition digital pieces, but the most interesting innovation comes from native digital designers creating works impossible in physical form.</p>
    
    <p class="mb-4">"My 'Gravitational Collapse' earrings couldn't exist in the physical world—they'd be too heavy and defy physics," explains Zoe Yang, a digital jewelry designer whose NFT pieces have sold for the equivalent of $25,000. "I'm designing for digital identities in virtual spaces, not physical bodies."</p>
    
    <p class="mb-4">Interestingly, established jewelers are finding that offering NFT versions of physical designs can create new revenue streams and attract younger collectors who may eventually become physical jewelry customers.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Challenges and Considerations</h3>
    
    <p class="mb-4">Despite the opportunities, jewelers entering the metaverse face significant challenges:</p>
    
    <ul class="list-disc pl-5 mb-4">
      <li class="mb-2"><strong>Technical expertise</strong> - Creating high-quality digital assets requires specialized skills</li>
      <li class="mb-2"><strong>Platform volatility</strong> - Virtual world popularity can shift rapidly</li>
      <li class="mb-2"><strong>Authentication concerns</strong> - Ensuring the value and provenance of digital-only pieces</li>
      <li class="mb-2"><strong>Customer education</strong> - Teaching traditional jewelry clients to navigate virtual experiences</li>
    </ul>
    
    <p class="mb-4">Despite these challenges, the potential rewards are compelling enough that analysts predict 75% of luxury jewelry brands will have significant metaverse presence by 2027.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Looking Ahead</h3>
    
    <p class="mb-4">For jewelers considering their metaverse strategy, experts recommend starting with modest experiments rather than major investments. Creating digital twins of bestselling pieces or hosting virtual events can provide valuable learning experiences without overwhelming resource commitments.</p>
    
    <p class="mb-4">"The metaverse won't replace physical jewelry retail, but it will become an essential channel," predicts digital retail analyst Morgan Cheng. "The jewelers who will thrive are those who see virtual and physical retail not as competing approaches, but as complementary experiences in a unified brand ecosystem."</p>
    
    <p class="mb-4">As the technology becomes more accessible and consumer adoption increases, virtual jewelry experiences may soon be as expected as websites became in the early 2000s—transitioning from innovative advantage to basic business necessity.</p>
    `
  },
  {
    id: 5,
    publicationId: 4,
    title: "The Return of Colored Gemstones in Engagement Rings",
    summary: "Exploring the growing trend of sapphires, emeralds, and other colored stones in bridal jewelry.",
    date: "2025-05-12",
    image: "https://images.unsplash.com/photo-1616117687336-dd2bc52e7bae?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    content: `
    <h2>The Return of Colored Gemstones in Engagement Rings</h2>
    <p class="text-sm text-gray-500 mb-4">Published on May 12, 2025 by Gems & Design</p>
    
    <img src="https://images.unsplash.com/photo-1616117687336-dd2bc52e7bae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" alt="Sapphire engagement ring" class="w-full rounded-lg mb-6" />
    
    <p class="mb-4">After decades of diamond dominance in the engagement ring market, colored gemstones are making a remarkable comeback. This resurgence represents not merely a fashion trend but a significant shift in consumer values and preferences that is reshaping the bridal jewelry landscape.</p>
    
    <p class="mb-4">According to industry data, colored gemstone engagement rings have seen a 43% increase in sales over the past three years, with particularly strong growth among millennial and Gen Z consumers. This trend shows no signs of slowing, with projections suggesting colored stones could represent up to 35% of the engagement ring market by 2027.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Historical Context</h3>
    
    <p class="mb-4">While diamonds became synonymous with engagement rings during the 20th century, colored gemstones were actually the traditional choice for centuries prior. From the sapphire that adorned Princess Diana's finger (later given to Kate Middleton) to the emeralds favored by Mughal emperors for their betrothal gifts, colored stones have deep historical roots in matrimonial jewelry.</p>
    
    <p class="mb-4">"We're not seeing something new, but rather a return to tradition," explains gemologist Dr. Helena Christensen. "Before the 1930s diamond marketing campaigns, colored stones were the predominant choice for engagement rings among European and Asian royalty and aristocracy."</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Leading the Revival: Sapphires</h3>
    
    <p class="mb-4">Among colored gemstones, sapphires have emerged as the clear favorite, accounting for approximately 52% of non-diamond engagement ring sales. Their appeal stems from several factors:</p>
    
    <ul class="list-disc pl-5 mb-4">
      <li class="mb-2"><strong>Durability</strong> - With a Mohs hardness of 9, sapphires are second only to diamonds in durability</li>
      <li class="mb-2"><strong>Color range</strong> - While blue remains most popular, sapphires naturally occur in virtually every color</li>
      <li class="mb-2"><strong>Ethical sourcing options</strong> - Transparent supply chains available from mines in Montana, Australia, and Sri Lanka</li>
      <li class="mb-2"><strong>Royal associations</strong> - The continued influence of the Diana/Kate sapphire ring</li>
    </ul>
    
    <p class="mb-4">"Montana sapphires in particular have seen explosive growth," notes gem dealer Melissa Vaughn. "Their American origin appeals to consumers concerned about ethical sourcing, while their unique teal and green-blue colors offer something distinctive."</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Emeralds: The Luxury Alternative</h3>
    
    <p class="mb-4">Emeralds represent the second most popular colored stone choice, particularly among luxury consumers. Despite their relative softness compared to diamonds and sapphires, advances in setting techniques have made emeralds more practical for daily wear.</p>
    
    <p class="mb-4">"The bezel settings and protective designs we're creating today can make an emerald engagement ring quite durable," explains jewelry designer Paolo Costagli. "We're seeing particular interest in Colombian emeralds with their distinctive bluish-green color."</p>
    
    <p class="mb-4">The rich green of emeralds also appeals to consumers looking for symbolism in their choice, with many drawn to the stone's associations with fertility, rebirth, and eternal love in various cultural traditions.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Other Popular Choices</h3>
    
    <p class="mb-4">Beyond sapphires and emeralds, several other colored stones are finding favor in the engagement ring market:</p>
    
    <ul class="list-disc pl-5 mb-4">
      <li class="mb-2"><strong>Morganite</strong> - Its soft pink hue and relative affordability have made it particularly popular with younger couples</li>
      <li class="mb-2"><strong>Alexandrite</strong> - The color-changing phenomenon appeals to those seeking something truly unique (though scarcity keeps numbers limited)</li>
      <li class="mb-2"><strong>Spinels</strong> - Once overlooked, these durable gems are gaining recognition for their brilliance and color range</li>
      <li class="mb-2"><strong>Tourmalines</strong> - Particularly the Paraíba variety, whose electric blue-green color commands premium prices</li>
    </ul>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">The Influence of Sustainability and Individuality</h3>
    
    <p class="mb-4">Several key factors are driving the colored gemstone revival:</p>
    
    <p class="mb-4"><strong>Ethical considerations</strong> - Consumers increasingly research the social and environmental impact of their purchases. Many colored gemstone mines are small-scale operations that can provide traceable stones with lower environmental impact than large industrial mining.</p>
    
    <p class="mb-4"><strong>Value perception</strong> - As consumers become more educated about the artificially controlled diamond market, many are questioning traditional price structures and seeking alternatives that offer better value or uniqueness.</p>
    
    <p class="mb-4"><strong>Personal expression</strong> - "Today's couples want their rings to tell their unique story," says bridal jewelry specialist Taylor Kim. "A particular color might represent where they met, their birthstone combination, or simply a personal aesthetic preference."</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Retailer Response</h3>
    
    <p class="mb-4">Jewelers across the spectrum are responding to this shift. Tiffany & Co. has expanded its colored gemstone engagement collection, while independent designers like Nak Armstrong and Erica Courtney have made colored stones central to their bridal offerings.</p>
    
    <p class="mb-4">Even online retailers are adapting, with platforms like Catbird and Brilliant Earth significantly expanding their colored stone options and education materials.</p>
    
    <p class="mb-4">"Five years ago, our non-diamond engagement options were an afterthought," admits Jonathan Miller, founder of online jewelry retailer GemSelect. "Today they represent 28% of our bridal sales and are our fastest-growing category."</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Looking Forward</h3>
    
    <p class="mb-4">As consumer preferences continue to evolve, the colored gemstone trend appears positioned for sustained growth rather than a passing fashion moment. The combination of historical precedent, practical advantages, and alignment with contemporary values suggests that colored engagement rings are reclaiming their place as a mainstream option rather than an alternative choice.</p>
    
    <p class="mb-4">For jewelers, this presents both challenges and opportunities. Those able to build expertise in colored stone quality factors, establish reliable sourcing channels, and create innovative settings designed for the particular properties of different gemstones will be well-positioned to serve this growing market segment.</p>
    `
  },
  {
    id: 6,
    publicationId: 6,
    title: "Advanced Setting Techniques for Unusual Stone Shapes",
    summary: "Master jewelers demonstrate innovative approaches to securely setting fancy-cut and irregular gemstones.",
    date: "2025-05-05",
    image: "https://images.unsplash.com/photo-1613746203812-717e6e5c9e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    content: `
    <h2>Advanced Setting Techniques for Unusual Stone Shapes</h2>
    <p class="text-sm text-gray-500 mb-4">Published on May 5, 2025 by MJSA Journal</p>
    
    <img src="https://images.unsplash.com/photo-1613746203812-717e6e5c9e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" alt="Stone setting process" class="w-full rounded-lg mb-6" />
    
    <p class="mb-4">As consumer demand for distinctive jewelry continues to rise, jewelers face increasing technical challenges in securely setting non-traditional gemstone shapes. From freeform slices to complex fantasy cuts, these stones require innovative approaches that go beyond conventional prong, bezel, and pavé settings.</p>
    
    <p class="mb-4">In this technical exploration, master jewelers share their advanced techniques for creating secure, visually striking settings for unusual stone shapes while maintaining wearability and durability.</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Custom Contouring for Freeform Stones</h3>
    
    <p class="mb-4">Seattle-based master goldsmith Janine Gibbons has developed a technique she calls "adaptive bezel setting" for accommodating the irregular edges of freeform stone slices and cabochons.</p>
    
    <p class="mb-4">"The key innovation is creating a bezel wire with variable thickness," Gibbons explains. "Rather than using uniform stock, I forge the wire to be thicker in areas where the stone has sharper projections or thinner edges that might be vulnerable to damage."</p>
    
    <p class="mb-4">Gibbons' process involves carefully mapping the stone's perimeter and identifying areas requiring additional support. She then creates a custom bezel wire by selectively forging sections to different thicknesses before forming it around the stone.</p>
    
    <p class="mb-4">"For extremely irregular shapes, I sometimes create a completely custom bezel by carving it directly in wax around the stone, then casting it," she adds. "This allows for absolute precision in following complex contours."</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">The "Floating Prong" Technique</h3>
    
    <p class="mb-4">For angular stones with dramatic geometric shapes, traditional prong placement often proves inadequate. Master jeweler Thomas Chen of Hong Kong has pioneered what he calls the "floating prong" technique to address this challenge.</p>
    
    <p class="mb-4">"With conventional prong setting, we're limited to placing prongs at the edges or corners of the stone," Chen notes. "But with complex cuts like razor cuts or kite shapes, this doesn't provide adequate security."</p>
    
    <p class="mb-4">Chen's solution involves creating extended prongs that reach from the setting's base to secure multiple points along the stone's edge, including areas that would be inaccessible to traditional prongs. These extended prongs are engineered with precise angles and internal support structures to maintain their position despite being elongated.</p>
    
    <p class="mb-4">"The visual effect is that the stone appears to float within a geometric framework," Chen explains. "But the engineering behind it creates an extremely secure setting, even for shapes with challenging angles."</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Tension-Assisted Channel Settings</h3>
    
    <p class="mb-4">For setting irregular shapes in bands and wider pieces, Parisian jeweler Sophie Marchand has developed a hybrid approach she calls "tension-assisted channel setting."</p>
    
    <p class="mb-4">"Traditional channel settings require relatively uniform stone shapes," Marchand explains. "But by incorporating principles from tension settings, we can securely hold stones with dramatically varied dimensions in a channel configuration."</p>
    
    <p class="mb-4">Marchand's technique involves creating a conventional channel but adding precisely engineered pressure points within the channel walls. These points apply calculated tension against specific areas of the stone, complementing the traditional channel support.</p>
    
    <p class="mb-4">"We use 3D modeling to identify the optimal contact points for each stone, then mill these precision features into the channel," she adds. "The result is a clean, minimalist setting that can accommodate stones with significant variation in width or thickness."</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Advanced Gypsy Settings for Uneven Pavilions</h3>
    
    <p class="mb-4">Tucson-based lapidary and metalsmith Juan Alvarez specializes in setting rough crystals and unusually cut stones with irregular pavilions—the bottom portions of the gems that would typically be hidden in the setting.</p>
    
    <p class="mb-4">"The challenge with uneven pavilions is creating stable, secure contact between the stone and the metal," Alvarez notes. "Traditional flush or gypsy settings assume a standardized pavilion angle."</p>
    
    <p class="mb-4">Alvarez's solution involves creating what he calls a "mapped seat" for each stone. Using digital scanning technology, he creates a precise 3D model of the stone's pavilion, then mills a negative of this shape into the metal.</p>
    
    <p class="mb-4">"It's essentially a custom-contoured seat for each stone," he explains. "Combined with strategic burnishing of the metal around the stone's crown, this creates an extremely secure setting that accommodates the natural variations in the material."</p>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Practical Considerations</h3>
    
    <p class="mb-4">While these advanced techniques create new possibilities for setting unusual stones, the master jewelers emphasize several practical considerations:</p>
    
    <ul class="list-disc pl-5 mb-4">
      <li class="mb-2"><strong>Durability assessment</strong> - Critically evaluate whether an unusual stone is appropriate for the intended piece's wear patterns</li>
      <li class="mb-2"><strong>Material selection</strong> - Some techniques require specific metal properties; for example, Chen's floating prongs work best with platinum or palladium white gold</li>
      <li class="mb-2"><strong>Time considerations</strong> - Custom settings typically require 30-50% more bench time than conventional settings</li>
      <li class="mb-2"><strong>Client education</strong> - Unusual settings may have specific care requirements that should be clearly communicated</li>
    </ul>
    
    <h3 class="text-xl font-semibold mb-3 mt-6">Future Directions</h3>
    
    <p class="mb-4">As technology continues to evolve, new possibilities are emerging for setting challenging stone shapes. Several jewelers mentioned exploring applications of micro-3D printing for creating ultra-precise settings, while others are experimenting with new metal alloys specifically engineered for flexibility and tension control.</p>
    
    <p class="mb-4">"The most exciting development might be the merging of traditional hand skills with digital precision," Gibbons suggests. "I can now hand-forge components with the confidence of knowing exactly how they'll interact with a digitally mapped stone."</p>
    
    <p class="mb-4">For jewelers looking to expand their capabilities with unusual stone shapes, these master craftspeople recommend a methodical approach: start with adaptation of familiar techniques, thoroughly test each new method with sample materials, and gradually build a repertoire of specialized approaches suited to your particular design aesthetic.</p>
    
    <p class="mb-4">With these advanced techniques in their toolkit, contemporary jewelers can push beyond conventional gemstone shapes to create pieces that showcase the full spectrum of nature's crystalline diversity—securely set for generations of wear.</p>
    `
  }
];

const JewelryArticlesSection = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);
  const { toast } = useToast();

  const handleToggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
      toast({
        title: "Removed from favorites",
        description: "The publication has been removed from your favorites.",
        variant: "default",
      });
    } else {
      setFavorites([...favorites, id]);
      toast({
        title: "Added to favorites",
        description: "The publication has been added to your favorites.",
        variant: "default",
      });
    }
  };

  const handleOpenArticle = (article: typeof articles[0]) => {
    setSelectedArticle(article);
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
  };

  const handleShareArticle = () => {
    if (navigator.share && selectedArticle) {
      const publication = publications.find(p => p.id === selectedArticle.publicationId);
      navigator.share({
        title: selectedArticle.title,
        text: `Check out this article from ${publication?.name}: ${selectedArticle.title}`,
        url: window.location.href,
      }).catch((error) => {
        console.log('Error sharing', error);
        toast({
          title: "Sharing not supported",
          description: "Your browser doesn't support sharing. Try copying the URL instead.",
          variant: "destructive",
        });
      });
    } else {
      toast({
        title: "Article link copied",
        description: "The article link has been copied to your clipboard.",
      });
    }
  };

  const filteredPublications = activeTab === 'all' 
    ? publications 
    : activeTab === 'favorites' 
      ? publications.filter(pub => favorites.includes(pub.id))
      : publications.filter(pub => pub.category === activeTab);

  const filteredArticles = activeTab === 'favorites'
    ? articles.filter(article => favorites.includes(article.publicationId))
    : activeTab === 'all'
      ? articles
      : activeTab === 'magazine'
        ? articles.filter(article => {
            const pub = publications.find(p => p.id === article.publicationId);
            return pub && pub.category === 'magazine';
          })
        : articles.filter(article => {
            const pub = publications.find(p => p.id === article.publicationId);
            return pub && pub.category === 'substack';
          });

  return (
    <section className="py-20 bg-neutral-50" style={{ 
      animation: 'none !important',
      transition: 'none !important',
      transform: 'none !important'
    }}>
      <div className="container mx-auto px-4" style={{ 
        animation: 'none !important',
        transition: 'none !important',
        transform: 'none !important'
      }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '3rem',
          isolation: 'isolate',
          containment: 'layout style paint',
          willChange: 'auto'
        }}>
          <h2 style={{ 
            fontSize: '36px',
            fontWeight: '700',
            color: 'rgb(38, 38, 38)',
            marginBottom: '16px',
            fontFamily: 'Georgia, Times, serif',
            lineHeight: '1.2',
            letterSpacing: 'normal',
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}>
            Industry Articles & Insights
          </h2>
          <p style={{ 
            color: 'rgb(82, 82, 82)',
            maxWidth: '672px',
            margin: '0 auto',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '16px',
            lineHeight: '1.5',
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}>
            Stay updated with the latest trends, news, and insights from your favorite jewelry publications and newsletters.
          </p>
        </div>

        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-2xl font-semibold text-neutral-800">Magazine Articles</h3>
            <div className="flex gap-2">
              {publications.filter(p => p.category === 'magazine').map((publication) => (
                <Button 
                  key={publication.id}
                  variant="outline" 
                  size="sm" 
                  className="inline-flex items-center gap-2 rounded-full"
                  onClick={() => handleToggleFavorite(publication.id)}
                >
                  <img 
                    src={publication.logo} 
                    alt={publication.name} 
                    className="h-4 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/80x30?text=Logo";
                    }}
                  />
                  {favorites.includes(publication.id) ? (
                    <Star className="h-3 w-3 text-secondary" fill="currentColor" />
                  ) : (
                    <StarOff className="h-3 w-3 text-neutral-400" />
                  )}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.filter(article => {
              const pub = publications.find(p => p.id === article.publicationId);
              return pub && pub.category === 'magazine';
            }).map((article) => {
              const publication = publications.find(p => p.id === article.publicationId);
              return (
                <Card key={article.id} className="bg-white overflow-hidden">
                  <div className="h-48 overflow-hidden cursor-pointer" onClick={() => handleOpenArticle(article)}>
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/300x200?text=Article+Image";
                      }}
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <img 
                          src={publication?.logo} 
                          alt={publication?.name} 
                          className="h-5 object-contain mr-2"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/80x30?text=Logo";
                          }}
                        />
                        <a 
                          href={publication?.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-medium text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {publication?.name}
                        </a>
                      </div>
                      <span className="text-xs text-neutral-500">{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="cursor-pointer" onClick={() => handleOpenArticle(article)}>
                      <h4 className="font-serif text-lg font-semibold text-neutral-800 mb-2 line-clamp-2">{article.title}</h4>
                      <p className="text-neutral-600 text-sm mb-4 line-clamp-3">{article.summary}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="text-sm"
                        onClick={() => handleOpenArticle(article)}
                      >
                        Read In App
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-sm"
                        asChild
                      >
                        <a href={publication?.url} target="_blank" rel="noopener noreferrer">
                          Visit Source
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-2xl font-semibold text-neutral-800">My Newsletters</h3>
            <div className="flex gap-2">
              {publications.filter(p => p.category === 'substack').map((publication) => (
                <Button 
                  key={publication.id}
                  variant="outline" 
                  size="sm" 
                  className="inline-flex items-center gap-2 rounded-full"
                  onClick={() => handleToggleFavorite(publication.id)}
                >
                  <span className="text-sm font-medium">{publication.name}</span>
                  {favorites.includes(publication.id) ? (
                    <Star className="h-3 w-3 text-secondary" fill="currentColor" />
                  ) : (
                    <StarOff className="h-3 w-3 text-neutral-400" />
                  )}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.filter(article => {
              const pub = publications.find(p => p.id === article.publicationId);
              return pub && pub.category === 'substack';
            }).map((article) => {
              const publication = publications.find(p => p.id === article.publicationId);
              return (
                <Card key={article.id} className="bg-white overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-primary mr-2" />
                        <span className="text-sm font-medium text-primary">{publication?.name}</span>
                      </div>
                      <span className="text-xs text-neutral-500">{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="cursor-pointer" onClick={() => handleOpenArticle(article)}>
                      <h4 className="font-serif text-xl font-semibold text-neutral-800 mb-3">{article.title}</h4>
                      <p className="text-neutral-600 text-sm mb-5">{article.summary}</p>
                    </div>
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => handleOpenArticle(article)}
                    >
                      Read Full Newsletter
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {favorites.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-neutral-200 mt-10">
              <h4 className="font-serif text-xl font-semibold text-neutral-800 mb-4">My Favorite Sources</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {publications.filter(pub => favorites.includes(pub.id)).map((publication) => (
                  <div key={publication.id} className="flex flex-col items-center p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                    <div className="h-8 mb-3 flex items-center">
                      <img 
                        src={publication.logo} 
                        alt={publication.name} 
                        className="h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/80x30?text=Logo";
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-center">{publication.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(publication.id)}
                      className="mt-2"
                    >
                      <Star className="h-4 w-4 text-secondary mr-1" fill="currentColor" />
                      <span className="text-xs">Favorited</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Article Reading Dialog */}
        <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && handleCloseArticle()}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            {selectedArticle && (
              <>
                <DialogHeader className="sticky top-0 bg-white z-10 p-6 border-b">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-2xl font-serif">{selectedArticle.title}</DialogTitle>
                    <Button variant="ghost" size="icon" onClick={handleShareArticle}>
                      <Share2 className="h-5 w-5 text-neutral-500" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-neutral-500">
                      {publications.find(p => p.id === selectedArticle.publicationId)?.name} · 
                      {new Date(selectedArticle.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCloseArticle}>
                      Close
                    </Button>
                  </div>
                </DialogHeader>
                <div className="p-6 article-content prose prose-neutral max-w-none prose-headings:font-serif prose-headings:text-neutral-800 prose-p:text-neutral-700 prose-img:rounded-lg" 
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default JewelryArticlesSection;