import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Question, Folder } from '../types';

export const exportQuestionsToPDF = async (questions: Question[], folder: Folder) => {
  try {
    // Criar um elemento temporário para renderizar o conteúdo
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '0';
    tempDiv.style.top = '0';
    tempDiv.style.opacity = '0';
    tempDiv.style.zIndex = '-1';
    tempDiv.style.width = '800px';
    tempDiv.style.padding = '40px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.6';
    
    // Criar o conteúdo HTML
    let htmlContent = `
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px;">
        <h1 style="color: #1F2937; font-size: 28px; margin: 0 0 10px 0;">ConCurso Pro</h1>
        <h2 style="color: #3B82F6; font-size: 22px; margin: 0 0 10px 0;">${folder.name}</h2>
        ${folder.description ? `<p style="color: #6B7280; font-size: 16px; margin: 0;">${folder.description}</p>` : ''}
        <p style="color: #6B7280; font-size: 14px; margin: 10px 0 0 0;">
          Total de questões: ${questions.length} | 
          Gerado em: ${new Date().toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    `;

    questions.forEach((question, index) => {
      htmlContent += `
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <span style="background-color: #EFF6FF; color: #1D4ED8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-right: 15px;">
              ${question.type === 'multiple' ? 'Múltipla Escolha' : 'Verdadeiro/Falso'}
            </span>
            <span style="color: #6B7280; font-size: 12px;">
              Questão ${index + 1} de ${questions.length}
            </span>
          </div>
          
          <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6; margin-bottom: 20px;">
            <h3 style="color: #1F2937; font-size: 16px; font-weight: 600; margin: 0 0 15px 0; line-height: 1.5;">
              ${question.title}
            </h3>
          </div>
      `;

      // Adicionar alternativas para múltipla escolha
      if (question.type === 'multiple' && question.options) {
        htmlContent += `<div style="margin-bottom: 20px;">`;
        question.options.forEach((option, optionIndex) => {
          const letter = String.fromCharCode(65 + optionIndex);
          const isCorrect = question.correctAnswer === letter;
          
          htmlContent += `
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px; padding: 12px; border-radius: 6px; ${isCorrect ? 'background-color: #ECFDF5; border: 1px solid #10B981;' : 'background-color: #F9FAFB; border: 1px solid #E5E7EB;'}">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; ${isCorrect ? 'background-color: #10B981; color: white;' : 'background-color: #6B7280; color: white;'} font-weight: 600; font-size: 12px; margin-right: 12px; flex-shrink: 0;">
                ${letter}
              </span>
              <span style="color: #1F2937; flex: 1;">
                ${option}
                ${isCorrect ? ' <strong style="color: #059669;">✓ CORRETA</strong>' : ''}
              </span>
            </div>
          `;
        });
        htmlContent += `</div>`;
      }

      // Adicionar resposta para verdadeiro/falso
      if (question.type === 'boolean') {
        const correctAnswer = question.correctBoolean ? 'CERTO' : 'ERRADO';
        const correctColor = question.correctBoolean ? '#10B981' : '#EF4444';
        const correctBg = question.correctBoolean ? '#ECFDF5' : '#FEF2F2';
        
        htmlContent += `
          <div style="margin-bottom: 20px;">
            <div style="display: flex; gap: 15px;">
              <div style="flex: 1; padding: 15px; border-radius: 6px; text-align: center; font-weight: 600; ${question.correctBoolean ? `background-color: ${correctBg}; border: 2px solid ${correctColor}; color: ${correctColor};` : 'background-color: #F9FAFB; border: 1px solid #E5E7EB; color: #6B7280;'}">
                CERTO ${question.correctBoolean ? '✓' : ''}
              </div>
              <div style="flex: 1; padding: 15px; border-radius: 6px; text-align: center; font-weight: 600; ${!question.correctBoolean ? `background-color: ${correctBg}; border: 2px solid ${correctColor}; color: ${correctColor};` : 'background-color: #F9FAFB; border: 1px solid #E5E7EB; color: #6B7280;'}">
                ERRADO ${!question.correctBoolean ? '✓' : ''}
              </div>
            </div>
          </div>
        `;
      }

      // Adicionar explicação se existir
      if (question.explanation) {
        htmlContent += `
          <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
            <h4 style="color: #92400E; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
              💡 Explicação:
            </h4>
            <p style="color: #92400E; margin: 0; line-height: 1.5;">
              ${question.explanation}
            </p>
          </div>
        `;
      }

      // Adicionar informações da questão
      htmlContent += `
          <div style="border-top: 1px solid #E5E7EB; padding-top: 15px; margin-top: 20px;">
            <p style="color: #6B7280; font-size: 12px; margin: 0;">
              Criada em: ${new Date(question.createdAt).toLocaleDateString('pt-BR')} | 
              Resposta: ${question.type === 'multiple' ? `Letra ${question.correctAnswer}` : correctAnswer}
            </p>
          </div>
        </div>
      `;
    });

    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);

    // Aguardar um pouco para garantir que o conteúdo seja renderizado
    await new Promise(resolve => setTimeout(resolve, 100));

    // Capturar o conteúdo como canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempDiv.scrollHeight
    });

    // Remover o elemento temporário
    document.body.removeChild(tempDiv);

    // Criar o PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Adicionar a primeira página
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Adicionar páginas adicionais se necessário
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Fazer o download do PDF
    const fileName = `${folder.name.replace(/[^a-zA-Z0-9]/g, '_')}_questoes_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Erro ao gerar o arquivo PDF. Tente novamente.');
  }
};