window.CMS_CONFIG = {
  brandName: "Bem Seu Tipo",
  shortName: "BST",
  logoUrl: "/assets/logo.png",
  apiBaseUrl: "/api/cms",
  demoMode: false,
  settingsTableName: "site_settings",
  leadsTableName: "leads",
  publicStatus: "published",
  draftStatus: "draft",
  defaultCover: "",

  sections: [
    {
      id: "blog",
      label: "Blog",
      group: "conteudo",
      icon: "file",
      table: "posts",
      categories: ["Tráfego Pago", "Estratégia", "Performance", "Dicas", "Cases"],
      fields: [
        { id: "author",       label: "Autor",            type: "text",     card: true,  placeholder: "Ex: BST Marketing" },
        { id: "reading_time", label: "Tempo de leitura", type: "text",     card: true,  placeholder: "Ex: 5 min" },
        { id: "excerpt",      label: "Resumo",           type: "textarea",              placeholder: "Uma frase que resume o artigo" },
        { id: "content",      label: "Conteúdo (JSON)",  type: "textarea",              placeholder: 'Array de blocos: [{"type":"paragraph","text":"..."}]' }
      ]
    },
    {
      id: "faq",
      label: "FAQ",
      group: "conteudo",
      icon: "help",
      table: "faq",
      categories: ["Geral", "Tráfego Pago", "Conteúdo", "Contrato"],
      fields: [
        { id: "question", label: "Pergunta", type: "text",     card: true },
        { id: "answer",   label: "Resposta", type: "textarea"             }
      ]
    },
    {
      id: "cases",
      label: "Cases de Sucesso",
      group: "conteudo",
      icon: "star",
      table: "cases",
      categories: ["Automotivo", "Hotelaria", "Alimentação", "Saúde", "Varejo", "Serviços"],
      fields: [
        { id: "client",   label: "Cliente",      type: "text",     card: true },
        { id: "result",   label: "Resultado",    type: "text",     card: true,  placeholder: "Ex: 18x o valor investido" },
        { id: "scenario", label: "O cenário",    type: "textarea"             },
        { id: "strategy", label: "A estratégia", type: "textarea"             },
        { id: "bullets",  label: "Bullets (um por linha)", type: "textarea"   }
      ]
    },
    {
      id: "metrics",
      label: "Métricas",
      group: "conteudo",
      icon: "bar-chart",
      table: "metrics",
      categories: ["Destaque"],
      fields: [
        { id: "target",  label: "Número (ex: 18)",    type: "text", card: true, placeholder: "18" },
        { id: "suffix",  label: "Sufixo (ex: x, +%)", type: "text", card: true, placeholder: "x" },
        { id: "label",   label: "Descrição",           type: "text",             placeholder: "Retorno máximo sobre investimento" }
      ]
    },
    {
      id: "depoimentos",
      label: "Depoimentos",
      group: "relacionamento",
      icon: "message",
      table: "testimonials",
      categories: ["Google", "WhatsApp", "Indicação", "Presencial"],
      fields: [
        { id: "author_role", label: "Cargo / Empresa", type: "text",   card: true },
        { id: "rating",      label: "Avaliação",       type: "select", card: true, options: ["5","4","3","2","1"] },
        { id: "text",        label: "Depoimento",      type: "textarea"           },
        { id: "source",      label: "Origem",          type: "select",            options: ["Google", "Site", "WhatsApp", "Indicação"] }
      ]
    }
  ]
};
