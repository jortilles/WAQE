/*
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at
 * http://mozilla.org/MPL/2.0/.
 *
 * Covered Software is provided under this License on an “as is” basis,
 * without warranty of any kind, either expressed, implied, or statutory,
 * including, without limitation, warranties that the Covered Software is
 * free of defects, merchantable, fit for a particular purpose or non-infringing.
 * The entire risk as to the quality and performance of the Covered Software is with You.
 * Should any Covered Software prove defective in any respect, You (not any Contributor)
 * assume the cost of any necessary servicing, repair, or correction.
 * This disclaimer of warranty constitutes an essential part of this License.
 * No use of any Covered Software is authorized under this License except under this disclaimer.
 */

package com.jortilles.waqe;

import com.jortilles.waqe.util.Utils;
import pt.webdetails.cpf.repository.api.IRWAccess;

import java.io.ByteArrayInputStream;
import java.io.UnsupportedEncodingException;


public class WaqeDefinition {
	
	private static final String ENCODING = "UTF-8";
	    
	public WaqeDefinition() {}
	
	public String save( String filePath, String wqdefJsonText ) throws Exception {
		IRWAccess access = Utils.getSystemOrUserRWAccess( filePath );

		System.out.println("Here we are trying to save");
		System.out.println("Filepath: " + filePath + " Definition: " + wqdefJsonText);
		
		if( access == null ) {
			System.out.println("Access is null" + access);
			throw new AccessFileException( "Access denied to file " + filePath );			
		}
		
		if( !access.saveFile( filePath, new ByteArrayInputStream( safeGetEncodedBytes( wqdefJsonText ) ) ) ) {
			System.out.println("Access is not null" + access);
			throw new WritingFileException( "Error writing file " + filePath );
		}
	    
	    return filePath;
	}
	
	private static byte[] safeGetEncodedBytes( String text ) {
		try {
			return text.getBytes( ENCODING );
		} catch( UnsupportedEncodingException ex ) {
			System.out.println("Unsuported Encoding");
			return null;
		}
	}
  
}
