import jsPDF from 'jspdf';
import { Question, Folder } from '../types';

export const exportQuestionsToPDF = async (questions: Question[], folder: Folder) => {
  try {
    // Criar o PDF diretamente
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Função para adicionar nova página se necessário
    const checkPageBreak = (neededHeight: number) => {
      if (yPosition + neededHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Cabeçalho
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55); // gray-800
    pdf.text('ConCurso Pro', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    pdf.setFontSize(18);
    pdf.setTextColor(59, 130, 246); // blue-600
    pdf.text(folder.name, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    if (folder.description) {
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128); // gray-600
      const descLines = pdf.splitTextToSize(folder.description, contentWidth);
      pdf.text(descLines, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += descLines.length * 5;
    }

    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    const infoText = `Total de questões: ${questions.length} | Gerado em: ${new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    pdf.text(infoText, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Linha separadora
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    questions.forEach((question, index) => {
      // Verificar se precisa de nova página
      checkPageBreak(30);

      // Cabeçalho da questão
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      const questionType = question.type === 'multiple' ? 'Múltipla Escolha' : 'Verdadeiro/Falso';
      pdf.text(`${questionType} - Questão ${index + 1} de ${questions.length}`, margin, yPosition);
      yPosition += 8;

      // Título da questão
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      const titleLines = pdf.splitTextToSize(question.title, contentWidth);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 6 + 5;

      if (question.type === 'multiple' && question.options) {
        question.options.forEach((option, optionIndex) => {
          checkPageBreak(8);
          const letter = String.fromCharCode(65 + optionIndex);
          const isCorrect = question.correctAnswer === letter;

          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(isCorrect ? 16, 185, 129 : 31, 41, 55);
          
          const optionText = `${letter}) ${option}${isCorrect ? ' ✓ CORRETA' : ''}`;
          const optionLines = pdf.splitTextToSize(optionText, contentWidth - 10);
          pdf.text(optionLines, margin + 5, yPosition);
          yPosition += optionLines.length * 5 + 2;
        });
        yPosition += 5;
      }

      if (question.type === 'boolean') {
        checkPageBreak(15);
        const correctAnswer = question.correctBoolean ? 'CERTO' : 'ERRADO';
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        
        // CERTO
        pdf.setTextColor(question.correctBoolean ? 16, 185, 129 : 107, 114, 128);
        pdf.text(`CERTO ${question.correctBoolean ? '✓' : ''}`, margin + 20, yPosition);
        
        // ERRADO
        pdf.setTextColor(!question.correctBoolean ? 239, 68, 68 : 107, 114, 128);
        pdf.text(`ERRADO ${!question.correctBoolean ? '✓' : ''}`, margin + 80, yPosition);
        
        yPosition += 10;
      }

      if (question.explanation) {
        checkPageBreak(15);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(146, 64, 14);
        pdf.text('💡 Explicação:', margin, yPosition);
        yPosition += 6;
        
        pdf.setFont('helvetica', 'normal');
        const explanationLines = pdf.splitTextToSize(question.explanation, contentWidth);
        pdf.text(explanationLines, margin, yPosition);
        yPosition += explanationLines.length * 4 + 5;
      }

      // Informações da questão
      checkPageBreak(10);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      const correctAnswerText = question.type === 'multiple' ? `Letra ${question.correctAnswer}` : (question.correctBoolean ? 'CERTO' : 'ERRADO');
      const infoLine = `Criada em: ${new Date(question.createdAt).toLocaleDateString('pt-BR')} | Resposta: ${correctAnswerText}`;
      pdf.text(infoLine, margin, yPosition);
      yPosition += 15;
    });

    // Salvar o PDF
    const fileName = `${folder.name.replace(/[^a-zA-Z0-9]/g, '_')}_questoes_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Erro ao gerar o arquivo PDF. Tente novamente.');
  }
};